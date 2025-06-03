'use client'
import './globals.css'
import { Account } from './component/account'
import { ShortAddress } from './component/account'
import { WalletOptions } from './component/wallet-options'
import { useAccount } from 'wagmi'
import Data from './component/data'




function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

const App = () => {
  return (
    
      <div className="bg-[#0a0d12] text-white p-3 mx-auto my-8 max-w-xl shadow-lg h-fit overflow-hidden lg:max-w-5xl mt-5">
              <div className='border border-1 border-white/20 py-7 h-fit'>
                        <div className=" w-full px-6 mb-4 flex justify-between items-center text-xs opacity-70 pb-2 border-b-1 border-white/20 ">
                          <span>DEX Portfolio</span>
                          <span><ShortAddress /></span>
                        </div>
                        <div className='lg:pl-15'>
                                  <div className="font-semibold text-[25px] leading-tight mt-6 px-6 lg:text-[40px] ">
                                    Track Your DEX Portfolio<br />in Real-Time
                                  </div>
                                  <div className="mb-6 text-sm opacity-80 mt-6 px-6">
                                    Connect your wallet. Monitor your assets. Stay informed.
                                  </div>
                                  <div className='mt-6 px-6'>
                                    <ConnectWallet />
                                  </div>
                        </div>
                        <div className='mt-6 px-6'>
                          <Data />
                      </div>
                </div>
      </div>
  )
}

export default App

