import { JSX } from "preact";



export default function ReloadButton(props: {onClick: JSX.MouseEventHandler<HTMLElement> }) {
    return (
        
        <div onClick={props.onClick} style={{
            position: "fixed",
            zIndex: "999",
            top: "0",
            cursor: "pointer",
            fontSize: "50px",
        }}>
            🔁
        </div>
    );
}