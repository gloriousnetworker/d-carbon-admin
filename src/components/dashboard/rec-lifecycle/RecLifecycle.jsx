"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletTab from "./WalletTab";
import ExportsTab from "./ExportsTab";
import ApprovalsTab from "./ApprovalsTab";

export default function RecLifecycle() {
  // A small refresh ticker so a successful export/approval can nudge the
  // wallet tab to re-fetch on next focus. Wallet reads are cheap.
  const [walletNonce, setWalletNonce] = useState(0);
  const bumpWallet = () => setWalletNonce((n) => n + 1);

  return (
    <div className="min-h-screen w-full bg-white p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-500 font-sfpro uppercase tracking-wide">
          REC Lifecycle
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Generate the WREGIS upload file, upload the ActiveCertificates response, and watch the wallet move from generated → submitted → approved.
        </p>
      </div>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="wallet"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Wallet
          </TabsTrigger>
          <TabsTrigger
            value="exports"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Exports
          </TabsTrigger>
          <TabsTrigger
            value="approvals"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="mt-0">
          <WalletTab refreshNonce={walletNonce} />
        </TabsContent>
        <TabsContent value="exports" className="mt-0">
          <ExportsTab onSuccess={bumpWallet} />
        </TabsContent>
        <TabsContent value="approvals" className="mt-0">
          <ApprovalsTab onSuccess={bumpWallet} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
