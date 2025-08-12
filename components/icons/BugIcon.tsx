import React from 'react';

const BugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75V12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25V4.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.922 6.413l1.836 1.836" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.243 17.243l1.836 1.836" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.922 17.243l1.836-1.836" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.243 6.413l1.836-1.836" />
    </svg>
);

export default BugIcon;