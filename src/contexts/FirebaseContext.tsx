/**
 * Firebase Context Provider
 * Provides Firebase services throughout the app
 */

import React, {createContext, useContext, ReactNode} from 'react';
import firebase from '../services/firebase';

interface FirebaseContextType {
  auth: typeof firebase.auth;
  firestore: typeof firebase.firestore;
  functions: typeof firebase.functions;
  storage: typeof firebase.storage;
  collections: typeof firebase.collections;
  cloudFunctions: typeof firebase.cloudFunctions;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({children}) => {
  const value: FirebaseContextType = {
    auth: firebase.auth,
    firestore: firebase.firestore,
    functions: firebase.functions,
    storage: firebase.storage,
    collections: firebase.collections,
    cloudFunctions: firebase.cloudFunctions,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
