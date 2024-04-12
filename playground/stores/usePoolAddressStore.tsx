import { create } from 'zustand';

interface PoolAddressStore {
  poolAddress: string;
  setPoolAddress: (poolAddress: string) => void;
}

export const usePoolAddressStore = create<PoolAddressStore>((set) => ({
  poolAddress: '',
  setPoolAddress: (poolAddress) => set({ poolAddress }),
}));
