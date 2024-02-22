import { Link } from "react-router-dom";
import { React } from 'react'
const Index = () => {
    return (
        <>
            <div className="heading">
                <br /> <br />
                <h1 className="v">
                    <h1 className="hA">
                        Fuel Your Journey with
                    </h1>
                </h1>
                <span className="hB"> CONFIDENCE.</span>
                <p className="hC">
                    Quoting that powers your peace of mind.
                </p>
            </div>
            <Link to='/quote'>
                <button type="request">REQUEST A QUOTE TODAY!</button>
            </Link>

        </>
    )
}

export default Index;