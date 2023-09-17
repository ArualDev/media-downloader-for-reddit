// import { MouseEventHandler } from "react";

import { JSX } from "preact";

// export default function DownloadButton(props: { btnText: string, onClick: MouseEventHandler }) {
//     return (
//         <div className="_JRBNstMcGxbZUxrrIKXe _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap" id="t3_16hfmxc-share-menu">
//             <button onClick={props.onClick} className="kU8ebCMnbXfjCWfqn0WPb">
//                 <span className="flex text-16 mr-[length:var(--rem6)]">
//                     <svg xmlns="http://www.w3.org/2000/svg" height="24" fill="currentColor" viewBox="0 -960 960 960" width="24">
//                         <path xmlns="http://www.w3.org/2000/svg" d="M480-352.923 346.461-486.462l23.308-21.769L464-414v-362h32v362l94.231-94.231 23.308 21.769L480-352.923ZM288.332-232Q264-232 248-248.15t-16-40.465v-48.923h32v48.923q0 9.23 7.692 16.923Q279.385-264 288.615-264h382.77q9.23 0 16.923-7.692Q696-279.385 696-288.615v-48.923h32v48.923q0 24.315-16.162 40.465Q695.676-232 671.344-232H288.332Z" />
//                     </svg>
//                 </span>
//                 <span className="_6_44iTtZoeY6_XChKt5b0">{props.btnText}</span>
//             </button>
//         </div>
//     );
// }

export default function DownloadButton(props: { btnText: string, onClick: JSX.MouseEventHandler<HTMLElement> }) {
    return (
        <div className="_JRBNstMcGxbZUxrrIKXe _3U_7i38RDPV5eBv7m4M-9J _3yh2bniLq7bYr4BaiXowdO _1pShbCnOaF7EGWTq6IvZux _28vEaVlLWeas1CDiLuTCap" id="t3_16hfmxc-share-menu">
            <button onClick={props.onClick} className="kU8ebCMnbXfjCWfqn0WPb">
                <span className="flex text-16 mr-[length:var(--rem6)]">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" fill="currentColor" viewBox="0 -960 960 960" width="24">
                        <path xmlns="http://www.w3.org/2000/svg" d="M480-352.923 346.461-486.462l23.308-21.769L464-414v-362h32v362l94.231-94.231 23.308 21.769L480-352.923ZM288.332-232Q264-232 248-248.15t-16-40.465v-48.923h32v48.923q0 9.23 7.692 16.923Q279.385-264 288.615-264h382.77q9.23 0 16.923-7.692Q696-279.385 696-288.615v-48.923h32v48.923q0 24.315-16.162 40.465Q695.676-232 671.344-232H288.332Z" />
                    </svg>
                </span>
                <span className="_6_44iTtZoeY6_XChKt5b0">{props.btnText}</span>
            </button>
        </div>
    );
}