
import Link from 'next/link'

export default function SlideV3() {
    return (
        <>
            <div className="tf-slider-v3">
                <div className="themesflat-container">
                    <div className="slider-v3 t-al-center">
                        <span className="wow fadeInUp" data-wow-delay="100ms" data-wow-duration="2000ms">Ahorra hasta <span className="text-red">15%</span></span>
                        <h1 className="wow fadeInUp" data-wow-delay="300ms" data-wow-duration="2000ms">ENCUENTRA EL VEHÍCULO IDEAL.
                            ¡VAMOS!</h1>
                        <p className="wow fadeInUp" data-wow-delay="600ms" data-wow-duration="2000ms">Kilometraje ilimitado · Sin
                            cargos ocultos · Cancelación gratuita</p>
                        <div className="group-button wow fadeInUp" data-wow-delay="900ms" data-wow-duration="2000ms">
                            {/* Button */}
                            <div className="btn-main ">
                                <Link href="/#" className="button_main_inner">
                                    <span>
                                        Ver inventario
                                    </span>
                                </Link>
                            </div>
                            {/* Button */}
                            {/* Button */}
                            <div className="btn-main">
                                <Link href="/#" className="button_main_inner">
                                    <span>Sobre nosotros
                                    </span>
                                </Link>
                            </div>
                            {/* Button */}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
