-- Firestore Security Rules
-- Copy this content to your Firestore Rules in the Firebase Console

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tips collection - read public, write authenticated
    match /tips/{tipId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.tipperAddress;
      allow update, delete: if false; // Tips are immutable
    }
    
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Creators collection - read public, write restricted
    match /creators/{creatorId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == creatorId;
    }
    
    // Notifications collection - users can only access their own tokens
    match /notifications/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
