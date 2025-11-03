import { ConfigProvider } from 'antd';
import { Toaster } from 'react-hot-toast';
import { theme } from './theme';
import '@/services/interceptors';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ConfigProvider theme={theme}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </ConfigProvider>
  );
};
