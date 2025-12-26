# 🔥 Firestore Setup Guide

## Issue: Students Not Showing in "Students Online"

### Root Cause
The "Students Online" tab shows a loading screen because:
1. **Firestore rules are too restrictive** - Users can't read the `users` collection
2. **Missing Firestore indexes** - The query fails silently
3. **No error handling** - The component doesn't show what went wrong

### Solution Applied
✅ Removed `orderBy` query that required an index
✅ Added comprehensive error handling
✅ Added detailed console logging
✅ Created proper Firestore rules

---

## 🚀 Quick Fix

### Step 1: Update Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /publicChats/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.senderId == request.auth.uid;
    }
    
    match /privateChats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null 
        && request.auth.uid in chatId.split('_');
    }
  }
}
```

5. Click **Publish**

### Step 2: Update Storage Rules

1. Go to **Storage** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024;
    }
  }
}
```

3. Click **Publish**

### Step 3: Test

1. Refresh both browsers (Firefox and Chrome)
2. Check browser console (F12) for logs
3. Go to "Students Online" tab
4. You should now see both users!

---

## 🔍 Debugging

### Check Browser Console

Open DevTools (F12) and look for:

**Good signs:**
```
Setting up users listener...
Users snapshot received: 2 documents
User data: abc123 {name: "User A", status: "online"}
User data: def456 {name: "User B", status: "online"}
Filtered users: 1
```

**Bad signs:**
```
Error fetching users: Missing or insufficient permissions
```

### Check Firestore Console

1. Go to Firebase Console → Firestore Database
2. Look for `users` collection
3. You should see documents for each logged-in user
4. Each document should have:
   - `uid`: User ID
   - `name`: User name
   - `email`: User email
   - `status`: "online" or "offline"
   - `photoURL`: Profile photo URL
   - `customStatus`: Custom status message
   - `lastSeen`: Timestamp
   - `createdAt`: Timestamp

### Manual Test

Try this in browser console:
```javascript
// Check if users collection is readable
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';

getDocs(collection(db, 'users')).then(snapshot => {
  console.log('Users found:', snapshot.docs.length);
  snapshot.docs.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}).catch(err => {
  console.error('Error:', err);
});
```

---

## 📋 Firestore Rules Explained

### Users Collection
```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

- **read**: Any authenticated user can read all user profiles (needed for "Students Online")
- **write**: Users can only update their own profile

### Public Chats
```javascript
match /publicChats/{messageId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.resource.data.senderId == request.auth.uid;
}
```

- **read**: Any authenticated user can read public messages
- **create**: Users can only create messages with their own senderId

### Private Chats
```javascript
match /privateChats/{chatId}/messages/{messageId} {
  allow read, write: if request.auth != null 
    && request.auth.uid in chatId.split('_');
}
```

- **read/write**: Only the two users in the chat can access messages
- Chat ID format: `userId1_userId2` (sorted alphabetically)

---

## 🔒 Security Best Practices

### Development (Current)
- ✅ Users can read all profiles
- ✅ Users can only write their own data
- ✅ Message validation (length, sender)
- ✅ File size limits (2MB)

### Production Enhancements
Consider adding:
- Rate limiting (max messages per minute)
- Content moderation
- User blocking/reporting
- Admin privileges
- Audit logging

---

## 🐛 Common Issues

### Issue: "Missing or insufficient permissions"
**Cause:** Firestore rules are too restrictive
**Fix:** Update rules as shown above

### Issue: "Users collection is empty"
**Cause:** Users haven't been created in Firestore
**Fix:** 
1. Log out and log back in
2. Check browser console for errors
3. Verify Firestore rules allow writes

### Issue: "Loading forever"
**Cause:** Query is failing silently
**Fix:** 
1. Check browser console for errors
2. Verify Firestore rules
3. Check network tab for failed requests

### Issue: "Only seeing myself"
**Cause:** Other users aren't in Firestore
**Fix:**
1. Have other users log out and back in
2. Check Firestore console for user documents
3. Verify status is set to "online"

---

## 📊 Data Structure

### Users Collection
```
users/
  {userId}/
    uid: string
    name: string
    email: string
    photoURL: string
    status: "online" | "offline"
    customStatus: string
    lastSeen: Timestamp
    createdAt: Timestamp
```

### Public Chats Collection
```
publicChats/
  {messageId}/
    text: string
    senderId: string
    senderName: string
    senderPhoto: string
    createdAt: Timestamp
    expiresAt: Timestamp (12 hours from creation)
```

### Private Chats Collection
```
privateChats/
  {chatId}/  // Format: userId1_userId2 (sorted)
    messages/
      {messageId}/
        text: string
        senderId: string
        createdAt: Timestamp
        expiresAt: Timestamp (7 days from creation)
```

---

## 🔄 Real-time Updates

The app uses Firestore's real-time listeners:

### Users Listener
```typescript
onSnapshot(collection(db, 'users'), (snapshot) => {
  // Updates automatically when any user's status changes
});
```

### Benefits:
- ✅ Instant updates when users come online/offline
- ✅ No polling required
- ✅ Efficient bandwidth usage
- ✅ Works across multiple tabs/devices

---

## 🧪 Testing Checklist

Test with two different browsers/accounts:

- [ ] Both users appear in "Students Online"
- [ ] Online status shows correctly
- [ ] Status updates in real-time
- [ ] Can click user to open private chat
- [ ] Can send private messages
- [ ] Can send public messages
- [ ] Profile updates reflect immediately
- [ ] Logout changes status to offline

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Update Firestore rules (copy from `firestore.rules`)
- [ ] Update Storage rules (copy from `storage.rules`)
- [ ] Test all features with production rules
- [ ] Set up Firebase monitoring
- [ ] Configure backup schedule
- [ ] Set up alerts for errors
- [ ] Review security rules
- [ ] Test with multiple users
- [ ] Verify real-time updates work
- [ ] Check performance metrics

---

## 🆘 Still Not Working?

### 1. Check Firebase Console
- Verify Firestore database exists
- Check if `users` collection has documents
- Look for error messages in Usage tab

### 2. Check Browser Console
- Look for red error messages
- Check network tab for failed requests
- Verify Firebase SDK is loaded

### 3. Check Authentication
- Verify users are logged in
- Check Firebase Auth console for users
- Verify email is verified (if required)

### 4. Try Clean Slate
```bash
# Clear browser data
# Log out all users
# Log back in
# Check Firestore console for new user documents
```

### 5. Use Debug Page
Visit: `http://localhost:8080/debug`
- Check all environment variables
- Test Firestore connection
- View current auth state

---

## ✅ Success Indicators

When everything works:

1. **Firestore Console:**
   - `users` collection has documents for each user
   - Each user has `status: "online"`

2. **Browser Console:**
   - "Users snapshot received: X documents"
   - "Filtered users: X"
   - No error messages

3. **App UI:**
   - "Students Online" shows other users
   - Online count is correct
   - Can click users to chat
   - Status indicators work

4. **Real-time:**
   - When user logs out in one browser, status updates in other
   - New users appear immediately
   - Profile changes reflect instantly

---

## 🎯 Next Steps

Once users are showing:

1. Test private messaging
2. Test profile updates
3. Test public chat
4. Deploy to production
5. Monitor for errors
6. Gather user feedback

---

## 📚 Resources

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Queries](https://firebase.google.com/docs/firestore/query-data/queries)
- [Real-time Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Storage Security](https://firebase.google.com/docs/storage/security)

---

## 💡 Pro Tips

1. **Always test rules before deploying**
2. **Use Firebase Emulator for local testing**
3. **Monitor Firestore usage to avoid costs**
4. **Set up alerts for permission errors**
5. **Keep rules as restrictive as possible**
6. **Document any custom rules**
7. **Test with multiple accounts**
8. **Check console logs regularly**

---

Your "Students Online" feature should now work perfectly! 🎉
