'use client'
import Link from 'next/link'
import { useState } from 'react'
import VideoPopup from '../elements/VideoPopup'

export default function Slide() {
    const [isToggled, setToggled] = useState(true)
    const handleToggle = () => setToggled(!isToggled)
    return (
        <>
            <div className="widget-tf-slider ">
                <div className="slider-wrap swiper-wrapper">
                    <div className="tf-slide-item swiper-slide">
                        <div className="slide-item-image">
                            <img src="/assets/images/slide/bg.jpg" alt="" />
                            <div className="overlay" />
                        </div>
                        <div className="slide-item-content">
                            <div className="slide-content">
                                <span className="wow fadeInUp sub-title" data-wow-delay="100ms" data-wow-duration="2000ms">Concesionario confiable</span>
                                <h1 className=" title-slide wow slideInUp" data-wow-delay="50ms" data-wow-duration="200ms">
                                    Nuevo, usado e importado.</h1>
                                <p className="description wow fadeInUp" data-wow-delay="300ms" data-wow-duration="2000ms">
                                    Más que autos, grandes decisiones. Su próximo vehículo lo espera.</p>
                                <div className="box">
                                    {/* Button */}
                                    <div className="btn-main wow fadeInUp" data-wow-delay="400ms" data-wow-duration="2000ms">
                                        <Link href="/#" className="button_main_inner ">
                                            <span>
                                                Ver listado
                                            </span>
                                        </Link>
                                    </div>
                                    {/* Button */}
                                    <div className="video-wrap wow fadeInUp" data-wow-delay="500ms" data-wow-duration="2000ms">
                                        <VideoPopup style={2} />
                                    </div>
                                </div>
                            </div>
                            <div className="slide-image">
                                <img src="/assets/images/slide/icon.png" className="icon-shape wow swing" alt="" />
                                <div className="box-offer">
                                    <p>40 <span>%</span></p>
                                    <span>de descuento</span>
                                </div>
                                <div className="box-car">
                                    <img src="/assets/images/slide/car.png" alt="" />
                                    <div className="dot-car">
                                        <div className="dot">
                                            <i className={isToggled ? "icon-Vector-5  active" : " icon-Vector-5 "} onClick={handleToggle}>
                                            </i>
                                            <div className={isToggled ? "content-price  active" : " content-price "}>
                                                <div className="proflile">
                                                    <span>Ford de lujo</span>
                                                    <span className="price">$13000</span>
                                                </div>
                                                <p>Av. Principal, Los Cortijos de Lourdes, Caracas</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box">
                                <span>(+58) 412-6512845</span>
                                <span>ventas@millcars.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
