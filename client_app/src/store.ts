import { configureStore, ThunkAction, Action  } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistStore, PURGE,  REGISTER, REHYDRATE,} from "redux-persist";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import todoReducer from './features/todo/todoSlice';

const persistConfig = {
  key: "root",
  storage
};


const persistedReducer = persistReducer(persistConfig, todoReducer);

export const store = configureStore({
  reducer: {
        todo: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

/*
export const store = configureStore({
  reducer: {
    todo:todoReducer
  }
})
*/


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;