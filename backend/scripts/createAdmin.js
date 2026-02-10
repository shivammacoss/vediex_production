import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config()

// Get credentials from environment variables or prompt user
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || null
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || null
const ADMIN_FIRST_NAME = process.env.SUPER_ADMIN_FIRST_NAME || 'Super'
const ADMIN_LAST_NAME = process.env.SUPER_ADMIN_LAST_NAME || 'Admin'
const ADMIN_URL_SLUG = process.env.SUPER_ADMIN_SLUG || 'vediex'

// Helper to prompt for input
function prompt(question, hidden = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN'], default: 'ADMIN' },
  urlSlug: { type: String, required: true, unique: true, lowercase: true },
  brandName: { type: String, default: '' },
  logo: { type: String, default: '' },
  parentAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canCreateUsers: { type: Boolean, default: true },
    canDeleteUsers: { type: Boolean, default: true },
    canViewUsers: { type: Boolean, default: true },
    canManageTrades: { type: Boolean, default: true },
    canCloseTrades: { type: Boolean, default: true },
    canModifyTrades: { type: Boolean, default: true },
    canManageAccounts: { type: Boolean, default: true },
    canCreateAccounts: { type: Boolean, default: true },
    canDeleteAccounts: { type: Boolean, default: true },
    canModifyLeverage: { type: Boolean, default: true },
    canManageDeposits: { type: Boolean, default: true },
    canApproveDeposits: { type: Boolean, default: true },
    canManageWithdrawals: { type: Boolean, default: true },
    canApproveWithdrawals: { type: Boolean, default: true },
    canManageKYC: { type: Boolean, default: true },
    canApproveKYC: { type: Boolean, default: true },
    canManageIB: { type: Boolean, default: true },
    canApproveIB: { type: Boolean, default: true },
    canManageCopyTrading: { type: Boolean, default: true },
    canApproveMasters: { type: Boolean, default: true },
    canManageSymbols: { type: Boolean, default: true },
    canManageGroups: { type: Boolean, default: true },
    canManageSettings: { type: Boolean, default: true },
    canManageTheme: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canExportReports: { type: Boolean, default: true },
    canManageAdmins: { type: Boolean, default: true },
    canFundAdmins: { type: Boolean, default: true }
  },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'ACTIVE' },
  lastLogin: { type: Date, default: null }
}, { timestamps: true })

const Admin = mongoose.model('Admin', adminSchema)

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Get credentials - from env or prompt
    let email = ADMIN_EMAIL
    let password = ADMIN_PASSWORD
    let firstName = ADMIN_FIRST_NAME
    let lastName = ADMIN_LAST_NAME
    let urlSlug = ADMIN_URL_SLUG

    // If not in env, prompt user
    if (!email) {
      console.log('\n🔐 Super Admin Setup\n')
      email = await prompt('Enter admin email: ')
    }
    if (!password) {
      password = await prompt('Enter admin password (min 8 chars): ')
    }
    if (!firstName || firstName === 'Super') {
      const name = await prompt('Enter first name (default: Super): ')
      firstName = name || 'Super'
    }
    if (!lastName || lastName === 'Admin') {
      const name = await prompt('Enter last name (default: Admin): ')
      lastName = name || 'Admin'
    }

    // Validate
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address')
      process.exit(1)
    }
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters')
      process.exit(1)
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      console.log('\n⚠️  Admin already exists!')
      console.log('Email:', existingAdmin.email)
      process.exit(0)
    }

    // Check if any super admin exists
    const existingSuperAdmin = await Admin.findOne({ role: 'SUPER_ADMIN' })
    if (existingSuperAdmin) {
      console.log('\n⚠️  A Super Admin already exists!')
      console.log('Email:', existingSuperAdmin.email)
      console.log('Use the admin panel to create additional admins.')
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      urlSlug,
      brandName: 'Vediex',
      status: 'ACTIVE'
    })

    console.log('\n✅ Super Admin created successfully!')
    console.log('Email:', email)
    console.log('\n⚠️  IMPORTANT: Store your password securely. It cannot be recovered.')
    console.log('Login at: https://admin.vediex.com/admin')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

createAdmin()
