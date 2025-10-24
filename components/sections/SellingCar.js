'use client'
import { useState } from 'react';
import Link from 'next/link'

export default function SellingCar() {
    const [activeItem, setActiveItem] = useState(1);

  const handleMouseOver = (index) => {
    setActiveItem(index);
  };
    return (
        <>
            <div className="widget-selling-car">
                <div className="themesflat-container">
                    <div className="selling-car-wrap">
                        <div className="heading-section t-al-center mb-60">
                            <span className="sub-title mb-6 wow fadeInUp">Encuentra tu auto por marca</span>
                            <h2 className="title wow fadeInUp">Autos más vendidos</h2>
                        </div>
                        <div className="selling-car">
                            <div className="selling-carpart">
                                <div className="offer-bg">
                                    <div className="offer">
                                        <div className="offer-sale">29<span>% off</span></div>
                                    </div>
                                </div>
                                <div className="carpart">
                                    <img src="./assets/images/page/mast.png" alt="" className="mask" />
                                    <img src="./assets/images/page/car.png" alt="" className="car" />
                                </div>
                                <div className={`item-dot right ${1 === activeItem ? 'active' : ''}`} onMouseOver={() => handleMouseOver(1)}>
                                    <Link href="/#">
                                        <div className="inner">
                                            <div className="group-title">
                                                <div className="title">
                                                    Car Suspension Disc
                                                </div>
                                            </div>
                                            <div className="description">
                                                <p>Lorem ipsum dolor sit amet ectetur adipisicing elit</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className={`item-dot dot-1 right ${2 === activeItem ? 'active' : ''}`} onMouseOver={() => handleMouseOver(2)}>
                                    <Link href="/#">
                                        <div className="inner">
                                            <div className="group-title">
                                                <div className="title">
                                                    Car Suspension Disc
                                                </div>
                                            </div>
                                            <div className="description">
                                                <p>Lorem ipsum dolor sit amet ectetur adipisicing elit</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className={`item-dot dot-2 ${3 === activeItem ? 'active' : ''}`} onMouseOver={() => handleMouseOver(3)}>
                                    <Link href="/#">
                                        <div className="inner">
                                            <div className="group-title">
                                                <div className="title">
                                                    Car Suspension Disc
                                                </div>
                                            </div>
                                            <div className="description">
                                                <p>Lorem ipsum dolor sit amet ectetur adipisicing elit</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className={`item-dot dot-3 ${4 === activeItem ? 'active' : ''}`} onMouseOver={() => handleMouseOver(4)}>
                                    <Link href="/#">
                                        <div className="inner">
                                            <div className="group-title">
                                                <div className="title">
                                                    Car Suspension Disc
                                                </div>
                                            </div>
                                            <div className="description">
                                                <p>Lorem ipsum dolor sit amet ectetur adipisicing elit</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <div className="selling-content">
                                <span className="sub-selling">Llegada reciente</span>
                                <h4 className="title-selling">Ford Explorer XLT-2018</h4>
                                <p className="des">Por 15 años, hemos elevado el estándar de autos usados
                                    con uno de los más innovadores y confiables programas de 
                                    vehículos usados jamás creados. Un rango completo de
                                </p>
                                <div className="price-selling">
                                    <span className="price-sale">$114700</span>
                                    <span className="price">$119000</span>
                                </div>
                                <div className="parameter">
                                    <ul>
                                        <li className="listing-information fuel">
                                            <i className="icon-gasoline-pump-1" />
                                            <div className="inner">
                                                <span>Tipo de combustible</span>
                                                <p>Gasolina</p>
                                            </div>
                                        </li>
                                        <li className="listing-information size-engine">
                                            <i className="icon-Group1" />
                                            <div className="inner">
                                                <span>Kilometraje</span>
                                                <p>90 k.m</p>
                                            </div>
                                        </li>
                                        <li className="listing-information transmission">
                                            <i className="icon-gearbox-1" />
                                            <div className="inner">
                                                <span>Transmisión</span>
                                                <p>Automática</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="btn-main">
                                    <Link href="/#" className="button_main_inner">
                                        <span>Comprar ahora</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
