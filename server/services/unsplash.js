// Unsplash Image Service for Property Listings
// Using curated Unsplash image URLs for realistic property images

// Curated property image collections from Unsplash
// These are real, high-quality property images (no API key required)
const PROPERTY_IMAGE_POOLS = {
  'Apartment': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&h=800&fit=crop'
  ],
  'Villa': [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=1200&h=800&fit=crop'
  ],
  'Independent House': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=1200&h=800&fit=crop'
  ],
  'Penthouse': [
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop'
  ],
  'Studio': [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1200&h=800&fit=crop'
  ]
};

// Generate a set of 5 random property images for a listing
export const generatePropertyImageSet = (propertyType = 'Apartment', location = '') => {
  const imagePool = PROPERTY_IMAGE_POOLS[propertyType] || PROPERTY_IMAGE_POOLS['Apartment'];
  
  // Select 5 random images from the pool
  const selectedImages = [];
  const poolSize = imagePool.length;
  const imageCount = Math.min(5, poolSize);
  
  // Randomly select images without repetition
  const usedIndices = new Set();
  while (selectedImages.length < imageCount) {
    const randomIndex = Math.floor(Math.random() * poolSize);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedImages.push(imagePool[randomIndex]);
    }
  }
  
  return selectedImages;
};

// Get curated property images (best quality images for featured listings)
export const getCuratedPropertyImages = (propertyType = 'Apartment') => {
  const imagePool = PROPERTY_IMAGE_POOLS[propertyType] || PROPERTY_IMAGE_POOLS['Apartment'];
  
  // Return the first 5 images (highest quality curated images)
  return imagePool.slice(0, 5);
};

// Get a single hero image for a property
export const getHeroImage = (propertyType = 'Apartment') => {
  const imagePool = PROPERTY_IMAGE_POOLS[propertyType] || PROPERTY_IMAGE_POOLS['Apartment'];
  
  // Return a random hero image
  const randomIndex = Math.floor(Math.random() * imagePool.length);
  return imagePool[randomIndex];
};

export default {
  generatePropertyImageSet,
  getCuratedPropertyImages,
  getHeroImage
};
