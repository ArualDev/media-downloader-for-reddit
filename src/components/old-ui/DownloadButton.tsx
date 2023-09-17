import { JSX } from "preact";
import "./style.css"

// export default class DownloadButton extends React.Component<{btnText: string, onClick: MouseEventHandler}> {
//     render(): React.ReactNode {
//         return (
//             <a onClick={this.props.onClick} href="#">{this.props.btnText}</a>
//         );
//     }
// }

// export default function DownloadButton(props: { btnText: string, onClick: MouseEventHandler }) {
//     return (
//         <a onClick={props.onClick} href="#">{props.btnText}</a>
//     );
// }

export default function DownloadButton(props: { btnText: string, onClick: JSX.MouseEventHandler<HTMLElement> }) {
    return (
        <a onClick={props.onClick} href="#">{props.btnText}</a>
    );
}