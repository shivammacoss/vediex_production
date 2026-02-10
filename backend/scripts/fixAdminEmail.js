import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function fixAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
  
  const c = mongoose.connection.collection('admins')
  
  // Find admin with potential whitespace
  const admin = await c.findOne({ role: 'SUPER_ADMIN' })
  
  if (admin) {
    console.log('Current email:', JSON.stringify(admin.email))
    console.log('Email length:', admin.email.length)
    
    // Trim the email
    const trimmedEmail = admin.email.trim().toLowerCase()
    console.log('Trimmed email:', JSON.stringify(trimmedEmail))
    
    if (admin.email !== trimmedEmail) {
      await c.updateOne(
        { _id: admin._id },
        { $set: { email: trimmedEmail } }
      )
      console.log('Email fixed!')
    } else {
      console.log('Email is already correct')
    }
  }
  
  process.exit(0)
}

fixAdmin().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
