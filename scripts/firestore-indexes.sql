-- Firestore Composite Indexes
-- Run these commands in your Firebase project using Firebase CLI

-- Tips by tipper address, ordered by creation time
firebase firestore:indexes:create --collection-group=tips --field-config=tipperAddress,ASCENDING --field-config=createdAt,DESCENDING

-- Tips by creator address, ordered by creation time  
firebase firestore:indexes:create --collection-group=tips --field-config=creatorAddress,ASCENDING --field-config=createdAt,DESCENDING

-- Creators ordered by total tips (for top creators)
firebase firestore:indexes:create --collection-group=creators --field-config=totalTips,DESCENDING

-- Tips by status and creation time (for filtering)
firebase firestore:indexes:create --collection-group=tips --field-config=status,ASCENDING --field-config=createdAt,DESCENDING
