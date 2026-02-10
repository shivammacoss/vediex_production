import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
  
  const c = mongoose.connection.collection('admins')
  const all = await c.find({}).toArray()
  
  console.log('\nTotal admins:', all.length)
  
  for (const admin of all) {
    console.log('\n--- Admin ---')
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('Status:', admin.status)
    console.log('Has password:', !!admin.password)
    console.log('Password hash length:', admin.password ? admin.password.length : 0)
    
    // Test password
    const testPassword = 'support@098'
    if (admin.password) {
      const isMatch = await bcrypt.compare(testPassword, admin.password)
      console.log('Password "support@098" matches:', isMatch)
    }
  }
  
  process.exit(0)
}

checkAdmin().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
