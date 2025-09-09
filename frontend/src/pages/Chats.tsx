import React from 'react';
import SecureChat from '@/components/SecureChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';



const Chats: React.FC = () => {
  return (
    <div className="h-screen w-full flex overflow-hidden relative sm:p-4 md:p-8 p-5 max-[640px]:ml-16 max-[640px]:w-[calc(100vw-5rem)] max-[500px]:overflow-x-auto max-sm:ml-[3rem] max-lg:ml-14 max-md:mr-10 -ml-2 max-sm:w-screen max-lg:w-[calc(100vw-3.5rem)]">
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Secure Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-5rem)]">
          <SecureChat />
        </CardContent>
      </Card>
    </div>
  );
};

export default Chats;