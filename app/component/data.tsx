import { BalanceComponent } from "./account"
import {ChartComponent} from "./account"
import { WalletData } from "./account"
import { TokenCountAlchemy } from "./account"
import Dashboard from "./Dashboard"

import { ComboboxDemo } from "./time-frame"
const Data =()=>{
    return(
        <div className="grid grid-cols-2 gap-4 lg:p-15">
           <div className="border border-1 border-white/20 rounded-md w-[160px] h-20 flex flex-col items-center justify-center gap-1 lg:w-[400px] lg:h-fit lg:p-5">
                       <span className="text-xs opacity-70 font-extrabold lg:text-[16px] lg:font-semibold">Real-Time ETH balance</span>
                       <span className="text-xs opacity-70"><BalanceComponent /></span>
           </div>

           <div className="border border-1 border-white/20 rounded-md w-[160px] h-20 flex flex-col items-center justify-center gap-1 lg:w-[400px] lg:h-fit lg:p-5">
                       <span className="text-xs opacity-70 font-extrabold lg:text-[16px] lg:font-semibold">Portfolio Tokens</span>
                       <span className="text-xs opacity-70"><TokenCountAlchemy /></span>
           </div>
           <div className="box-border mt-4 border border-1 border-white/20 rounded-md w-full col-span-2 h-[200px] lg:col-span-1 lg:w-[400px] lg:h-[300px] flex justify-start items-start p-0">
               <WalletData />
           </div>
           <div className="p-0 mt-4 border border-1 border-white/20 rounded-md w-full h-64 flex flex-col items-center justify-start col-span-2 lg:col-span-1 lg:w-[400px] lg:h-[300px]">
               <div className="w-full h-[40px] border-b border-1 border-white/20 p-4 flex items-center justify-between">
                    <span className="font-semibold text-xs">Portfolio Chart</span><ComboboxDemo />
               </div>
               <div className="flex justify-center items-center w-[100%] h-[100%]">
                    <ChartComponent />
               </div>
               
           </div>
           <div className="col-span-2">
            <Dashboard />
           </div>
          
        </div>
    )
}
export default Data