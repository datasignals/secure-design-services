import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import App from "./screens/App";

const root = ReactDOM.createRoot(
    document.getElementById('cn-wrapper') as HTMLElement
);


root.render(
    // <StrictMode>
        <App/>
    // </StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
