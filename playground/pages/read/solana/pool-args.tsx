import PoolArgs from '@/components/read-methods/PoolArgs';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';

const PoolArgsPage = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  return <PoolArgs />;
};

export default PoolArgsPage;
