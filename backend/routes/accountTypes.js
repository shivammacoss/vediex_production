import express from 'express'
import AccountType from '../models/AccountType.js'
import Charges from '../models/Charges.js'

const router = express.Router()

// GET /api/account-types - Get all active account types (for users)
router.get('/', async (req, res) => {
  try {
    const accountTypes = await AccountType.find({ isActive: true }).sort({ createdAt: -1 })
    
    // Fetch actual spread and commission from Charges for each account type
    const accountTypesWithCharges = await Promise.all(accountTypes.map(async (at) => {
      const atObj = at.toObject()
      
      // Find charges for this account type (both ACCOUNT_TYPE level and SEGMENT level with accountTypeId)
      const charges = await Charges.find({ 
        isActive: true, 
        accountTypeId: at._id
      })
      
      console.log(`[AccountTypes] Found ${charges.length} charges for ${at.name}:`, charges.map(c => ({
        segment: c.segment,
        spreadValue: c.spreadValue,
        commissionValue: c.commissionValue
      })))
      
      // Get the highest spread value from any charge (regardless of segment)
      let maxSpread = 0
      let maxCommission = 0
      
      for (const charge of charges) {
        if (charge.spreadValue > maxSpread) {
          maxSpread = charge.spreadValue
        }
        if (charge.commissionValue > maxCommission) {
          maxCommission = charge.commissionValue
        }
      }
      
      // Override minSpread and commission with values from Charges if found
      if (maxSpread > 0) {
        atObj.minSpread = maxSpread
        console.log(`[AccountTypes] Setting minSpread for ${at.name} to ${maxSpread}`)
      }
      if (maxCommission > 0) {
        atObj.commission = maxCommission
        console.log(`[AccountTypes] Setting commission for ${at.name} to ${maxCommission}`)
      }
      
      return atObj
    }))
    
    res.json({ success: true, accountTypes: accountTypesWithCharges })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching account types', error: error.message })
  }
})

// GET /api/account-types/all - Get all account types (for admin)
router.get('/all', async (req, res) => {
  try {
    const accountTypes = await AccountType.find().sort({ createdAt: -1 })
    res.json({ accountTypes })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account types', error: error.message })
  }
})

// POST /api/account-types - Create account type (admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isDemo, demoBalance } = req.body
    const accountType = new AccountType({
      name,
      description,
      minDeposit,
      leverage,
      exposureLimit,
      minSpread: minSpread || 0,
      commission: commission || 0,
      isDemo: isDemo || false,
      demoBalance: isDemo ? (demoBalance || 10000) : 0
    })
    await accountType.save()

    // Auto-create Charges entry for this account type if spread or commission is set
    if ((minSpread && minSpread > 0) || (commission && commission > 0)) {
      await Charges.create({
        level: 'ACCOUNT_TYPE',
        accountTypeId: accountType._id,
        spreadType: 'FIXED',
        spreadValue: minSpread || 0,
        commissionType: 'PER_LOT',
        commissionValue: commission || 0,
        commissionOnBuy: true,
        commissionOnSell: true,
        commissionOnClose: false,
        isActive: true
      })
      console.log(`[AccountType] Auto-created Charges entry for ${name}: spread=${minSpread}, commission=${commission}`)
    }

    res.status(201).json({ message: 'Account type created', accountType })
  } catch (error) {
    res.status(500).json({ message: 'Error creating account type', error: error.message })
  }
})

// PUT /api/account-types/:id - Update account type (admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isActive, isDemo, demoBalance } = req.body
    const accountType = await AccountType.findByIdAndUpdate(
      req.params.id,
      { name, description, minDeposit, leverage, exposureLimit, minSpread, commission, isActive, isDemo, demoBalance },
      { new: true }
    )
    if (!accountType) {
      return res.status(404).json({ message: 'Account type not found' })
    }

    // Update or create Charges entry for this account type
    const existingCharge = await Charges.findOne({ level: 'ACCOUNT_TYPE', accountTypeId: req.params.id })
    
    if (existingCharge) {
      // Update existing charge
      existingCharge.spreadValue = minSpread || 0
      existingCharge.commissionValue = commission || 0
      await existingCharge.save()
      console.log(`[AccountType] Updated Charges entry for ${name}: spread=${minSpread}, commission=${commission}`)
    } else if ((minSpread && minSpread > 0) || (commission && commission > 0)) {
      // Create new charge if spread or commission is set
      await Charges.create({
        level: 'ACCOUNT_TYPE',
        accountTypeId: req.params.id,
        spreadType: 'FIXED',
        spreadValue: minSpread || 0,
        commissionType: 'PER_LOT',
        commissionValue: commission || 0,
        commissionOnBuy: true,
        commissionOnSell: true,
        commissionOnClose: false,
        isActive: true
      })
      console.log(`[AccountType] Created Charges entry for ${name}: spread=${minSpread}, commission=${commission}`)
    }

    res.json({ message: 'Account type updated', accountType })
  } catch (error) {
    res.status(500).json({ message: 'Error updating account type', error: error.message })
  }
})

// DELETE /api/account-types/:id - Delete account type (admin)
router.delete('/:id', async (req, res) => {
  try {
    const accountType = await AccountType.findByIdAndDelete(req.params.id)
    if (!accountType) {
      return res.status(404).json({ message: 'Account type not found' })
    }
    
    // Also delete associated Charges entries
    await Charges.deleteMany({ accountTypeId: req.params.id })
    console.log(`[AccountType] Deleted Charges entries for account type ${req.params.id}`)
    
    res.json({ message: 'Account type deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account type', error: error.message })
  }
})

// POST /api/account-types/sync-charges - Sync all existing AccountTypes to Charges collection
router.post('/sync-charges', async (req, res) => {
  try {
    const accountTypes = await AccountType.find()
    let synced = 0
    
    for (const at of accountTypes) {
      if (at.minSpread > 0 || at.commission > 0) {
        // Check if charge already exists
        const existingCharge = await Charges.findOne({ level: 'ACCOUNT_TYPE', accountTypeId: at._id })
        
        if (existingCharge) {
          // Update existing
          existingCharge.spreadValue = at.minSpread || 0
          existingCharge.commissionValue = at.commission || 0
          await existingCharge.save()
        } else {
          // Create new
          await Charges.create({
            level: 'ACCOUNT_TYPE',
            accountTypeId: at._id,
            spreadType: 'FIXED',
            spreadValue: at.minSpread || 0,
            commissionType: 'PER_LOT',
            commissionValue: at.commission || 0,
            commissionOnBuy: true,
            commissionOnSell: true,
            commissionOnClose: false,
            isActive: true
          })
        }
        synced++
        console.log(`[Sync] AccountType ${at.name}: spread=${at.minSpread}, commission=${at.commission}`)
      }
    }
    
    res.json({ success: true, message: `Synced ${synced} account types to Charges collection` })
  } catch (error) {
    console.error('Error syncing charges:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
