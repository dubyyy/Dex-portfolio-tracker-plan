
'use client'
import * as React from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  const injectedConnectors = connectors.filter((connector) => connector.id === 'injected')


  return (
    <div className="flex flex-col gap-4">
      {injectedConnectors.map((connector) => (
        <WalletOption
          key={connector.uid}
          connector={connector}
          onClick={() => connect({ connector })}
        />
      ))}
    </div>
  )
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      try {
        const provider = await connector.getProvider()
        setReady(!!provider)
      } catch (err) {
        console.error(`Failed to get provider for ${connector.name}`, err)
        setReady(false)
      }
    })()
  }, [connector])

  return (
    <button
      disabled={!ready}
      onClick={onClick}
      className="w-35 bg-[#233876] text-white border-none px-6 py-3 rounded-lg font-semibold text-[12px] cursor-pointer shadow-md hover:bg-[#2d478f] transition disabled:opacity-50 "
    >
      Connect Wallet 
    </button>
  )
}
