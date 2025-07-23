// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${process.env.FIREBASE_API_KEY}`,
  authDomain: "devrecall-d92e5.firebaseapp.com",
  projectId: "devrecall-d92e5",
  storageBucket: "devrecall-d92e5.firebasestorage.app",
  messagingSenderId: "71771376018",
  appId: "1:71771376018:web:d786fa717998d60719594b",
  measurementId: "G-ZJ9RMGVQ35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress: (progress: number)=> void){
    return new Promise((resolve, reject) => {
        try{
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', snapshot=>{
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes)) * 100;
                if(setProgress) setProgress(progress);
                switch(snapshot.state){
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },error => {
                reject(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                    resolve(downloadUrl as string)
                });
            });
        }
        catch(error){
            console.error("Error uploading file:", error);
            reject(error); 
        }
    })

}