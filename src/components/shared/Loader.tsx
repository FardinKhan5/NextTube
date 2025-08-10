import React from 'react'
import { Spinner } from '../ui/spinner';

function Loader() {
    return (
        <div className="flex-1 flex justify-center items-center">
            <Spinner />
        </div>
    );
}

export default Loader