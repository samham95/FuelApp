import { Link } from "react-router-dom";
import { React } from 'react'
const Index = () => {
    return (
        <>
            <div className="heading">
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

            <div>
                <img className='card-art' src="landing.png"></img>
            </div>

            <div className="row" id="containers">
                <div className="column">
                    <div className="card">
                        <div className="card-container">
                            <img className='card-icon' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAIhJREFUSEtjZKAxYKSx+Qx0t8CBgYGhnoGBAUSTAw4wMDA0AvWDaDBA98F9BgYGBXJMRtIDMtwRlwX/cVhMrJ0Y+tF9MGrBaBARTEyjQTQEgogaZdEDBgYGRVxlEagU3U8wIPArABV0WEtTWBKj0Hy4dnA5h1zY0dwCarkcxRy6V5lU9wXNfQAAnY8hGYBzYI8AAAAASUVORK5CYII=" />
                            <h2><b>Simple Process</b></h2>
                            <p> Learn how easy it is to get a fuel quote with our intuitive platform.
                                From entering your location to receiving accurate pricing information,
                                we've streamlined the process for your convenience.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="column">
                    <div className="card">
                        <div className="card-container">
                            <img className='card-icon' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAUlJREFUSEu1lYsNAUEQhkclqASVoBJUgkpQCZ1wXzJ/MtjZPXK3iezZx3z/PG5uYiOPycj2rQaYmdnazJb+e3Tz1cyYzz439WWAXXdzX7kN5GRmhxahBLi4Yu4CublyPMKbaYDj0aoG+QRsOgNHd3/rhkv3gSGEGRGpJxHA4btbQxXqWCNcKCcsDMA8swaE51RMBCjuxJYLjCwXczeMt3idehEBOoxxIBoYkHp5I4PyIs1FBBAeQiJ1pdjLIHvcVVgRwL2v8SugZOPpi8WSj4sqTyW4VeLsq+pi3t7utZLcgihvvQClMq0BYj7SvP37okXjvV80qZXb/Md1tQr+4+XC617nqSDyplJOcxA3Ws2OsygnyUBTSKtdEwoUMzPUstV7Yk8qQob44FQhQwCUG3XXt1YzFEAQQhn7WPWT2XrJeu0P6UERODrgBZ5/VhnZJN56AAAAAElFTkSuQmCC" />
                            <h2><b>Transparent Pricing</b></h2>
                            <p> We believe in transparency. Our pricing is clear and straightforward,
                                with no hidden fees or surprises. Know exactly what you're paying for with our fuel quotes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="column">
                    <div className="card">
                        <div className="card-container">
                            <img className='card-icon' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAWRJREFUSEu1lOtRAzEMhJVOSCdQCaQSoBKgktAJUAnkY7yZPZ3lc36cZzKJH9pdraQcYud12Bk/biF4joj7iLi7fN4j4nVG3AwBwE8N2DG/Z4hGBBlYgD8RwR2ZsIZEPYIK2C0BHLs2iTLBuQVuKmvqe0SfEfEgLzPBb7t4mS1iInpr+ytuRTBTfKmno7QksCT4asXbIgActdTh1LoJkk0C1QAP8ZJFIT9at7B3cDro2N5BRvywBoDhv1RpD5AKJ+UODgezwh2WEf+/shVZBWpRxTeAfHiTwcECHBK3bEUAEHVwACdR+8oWn+yV/70MOFMdPFWRcN8Dl/qFPRWBZ4HvZKPi6rcr13vOvDm6NVCgFPW8dvAq4+ubqt/d91XaxiA7SyGjgXISepvucLu8XbnT3CwynJlYb1P9LTAr6qgSvCpy9phMHi+HAtX9YmJzkPZbGeRuwRYIh6o96BaCSuTwfHeCP+gCXxnJbiayAAAAAElFTkSuQmCC" />
                            <h2><b>Why Choose Us</b></h2>
                            <p> Discover the advantages of using our fuel quoting service,
                                including saving time and money, accessing real-time pricing data,
                                and making informed decisions about fuel purchases.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="column">
                    <div className="card">
                        <div className="card-container">
                            <img className='card-icon' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAXdJREFUSEu1lYFNQzEMRN1NYBOYBJgEmAQ2oUwCm0BflYuujsNPkX6kqr+p7buc/zmH2Hkddq4f/wX4asSOEfEZEe8zohXATUS8nZL4vo+I7yL5J+0RU8ZmABW/awVmicTp89yeieUkrw7uAF5crNmbsmuFiHk4Pb+02KeIQLrzcgBkeWxBt43Vh7FzCegBwBQS45w/AEjXfCoHAZjlPQAoE4LM+RReDFYcl2CXCGb0hAQSWcSxBI4s6E8/kKrHOgDBFOrorQB7YplfKP4jTwX1u8c7gNBhIF0rUAfhJOqHZPLfFxIN6NWRr3V+bqgcKpnEkLou3TJONtrQJDsFuiKdxsKK44dZVDGu3M1bA5ktx5fDDrPxarqD3a0uz6bjZ9NUUuUxISBIsLYcPx3XeS4NQyx1mfjK8X/eB1kWzZ0+yAzECbnjly4cyaV6GstcNOqBxsng+NUbbdbk3HANw76/CqAEXTLMf790fLxctOdagGUHK3B3gF/65nYZH364qgAAAABJRU5ErkJggg==" />
                            <h2><b>Contact Us</b></h2>
                            <p> Have questions or need assistance?
                                Reach out to our friendly team for support.
                                We're here to help you with all your fueling needs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Index;