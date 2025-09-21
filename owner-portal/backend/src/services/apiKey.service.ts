import OwnerApiKeys from '../models/OwnerApiKeys.model'

export interface ApiKeyData {
  hostkitApiKey: string
  hostkitApiSecret: string
}

export const getApiKeyForOwner = async (ownerId: string): Promise<ApiKeyData | null> => {
  try {
    const apiKeys = await OwnerApiKeys.findOne({ 
      ownerId, 
      isActive: true 
    })
    
    if (!apiKeys) {
      return null
    }
    
    return {
      hostkitApiKey: apiKeys.hostkitApiKey,
      hostkitApiSecret: apiKeys.hostkitApiSecret
    }
  } catch (error) {
    console.error('Error fetching API keys for owner:', error)
    return null
  }
}

export const createApiKeysForOwner = async (
  ownerId: string, 
  hostkitApiKey: string, 
  hostkitApiSecret: string
): Promise<boolean> => {
  try {
    await OwnerApiKeys.create({
      ownerId,
      hostkitApiKey,
      hostkitApiSecret,
      isActive: true
    })
    return true
  } catch (error) {
    console.error('Error creating API keys for owner:', error)
    return false
  }
}

export const updateApiKeysForOwner = async (
  ownerId: string, 
  hostkitApiKey: string, 
  hostkitApiSecret: string
): Promise<boolean> => {
  try {
    await OwnerApiKeys.findOneAndUpdate(
      { ownerId },
      { 
        hostkitApiKey, 
        hostkitApiSecret,
        updatedAt: new Date()
      },
      { upsert: true }
    )
    return true
  } catch (error) {
    console.error('Error updating API keys for owner:', error)
    return false
  }
}

export const deleteApiKeysForOwner = async (ownerId: string): Promise<boolean> => {
  try {
    await OwnerApiKeys.findOneAndUpdate(
      { ownerId },
      { isActive: false }
    )
    return true
  } catch (error) {
    console.error('Error deleting API keys for owner:', error)
    return false
  }
}

export const getAllOwnerApiKeys = async () => {
  try {
    return await OwnerApiKeys.find({ isActive: true })
  } catch (error) {
    console.error('Error fetching all owner API keys:', error)
    return []
  }
}

