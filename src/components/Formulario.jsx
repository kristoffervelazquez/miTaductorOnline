import { useState } from "react"
import axios from "axios";
import Alerta from "./Alerta";
// import { detectarIdioma } from '../helpers/API'



const Formulario = () => {

    const [microfonoState, setMicrofonoState] = useState('Microfono');
    const [alerta, setAlerta] = useState({});
    const [idiomaUno, setIdiomaUno] = useState('es');
    const [idiomaDos, setIdiomaDos] = useState('en');
    const [textoUno, setTextoUno] = useState('');
    const [textoDos, setTextoDos] = useState('');

    const detectarIdioma = (texto) => {
        const options = {
            method: 'POST',
            url: 'https://microsoft-translator-text.p.rapidapi.com/Detect',
            params: { 'api-version': '3.0' },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
                'X-RapidAPI-Key': 'aaca00f86amshf414996a122ccbap19dbbejsnba9e8f635148'
            },
            data: `[{"Text":"${texto}"}]`
        };

        axios.request(options).then(function (response) {
            const { language, score } = response.data[0]

            setIdiomaUno(language);
            setAlerta({ msg: `Idioma detectado: ${language}, Fidelidad: ${score}` })

        }).catch(function (error) {
            console.error(error);
        });

    }

    const traducirTexto = (texto, idioma) => {
        const options = {
            method: 'POST',
            url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
            params: {
                'to[0]': idioma,
                'api-version': '3.0',
                profanityAction: 'NoAction',
                textType: 'plain'
            },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
                'X-RapidAPI-Key': 'aaca00f86amshf414996a122ccbap19dbbejsnba9e8f635148'
            },
            data: `[{"Text":"${texto}"}]`
        };

        axios.request(options).then(function (response) {
            console.log(response.data);

            setTextoDos(response.data[0].translations[0].text);
            setIdiomaUno(response.data[0].detectedLanguage.language);

        }).catch(function (error) {
            setAlerta({ msg: 'Hubo un error al intentar traducir el Texto, Intenta de nuevo', error: true });
        });
    }

    const ejecutarSpeechAPI = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.start();

            recognition.onstart = function () {
                setTextoUno('...')
                setMicrofonoState('Escuchando...')
            }

            recognition.onspeechend = function () {
                console.log('Se dejó de grabar...')
                recognition.stop();
            };

            recognition.onresult = function (e) {
                console.log(e.results[0][0]);

                const { confidence, transcript } = e.results[0][0];

                setMicrofonoState('Microfono')
                setTextoUno(transcript);
                setAlerta({ msg: `Grabado con una fidelidad de ${confidence / 100}` })
            }

        } catch (error) {
            setAlerta({ msg: 'El navegador no es compatible con esta función', error: true });
            console.log(error)
        }
    }

    const speak = (e) => {
        e.preventDefault()
        const synth = window.speechSynthesis;

        try {
            // Check if speaking
            if (synth.speaking) {
                console.error('Already speaking..');
                return;
            }
            if (textoDos !== '') {
                // Get speak text
                const speakText = new SpeechSynthesisUtterance(textoDos);

                // Speak end
                speakText.onend = e => {
                    console.log('Done speaking.');
                }

                // Speak error
                speakText.onerror = (e) => {
                    console.error('Error: ', e)
                }

                speakText.lang = idiomaDos
                console.log(speakText.lang);

                synth.speak(speakText);
                setAlerta({});

            } else {
                setAlerta({msg: 'Texto vacio', error: true});
            }

        } catch (error) {
            setAlerta({msg: 'Función no disponible en este idioma', error: true});
            console.log(error)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if ([idiomaUno, idiomaDos].includes('')) {
            setAlerta({ msg: 'Por favor elige tu idioma', error: true });
            return;
        }

        if ([textoUno].includes('')) {
            setAlerta({ msg: 'Por favor inserta un texto', error: true });
            return;
        }

        traducirTexto(textoUno, idiomaDos);
        setAlerta({});


    }

    const { msg } = alerta;

    return (
        <>
            <h1 className="text-indigo-600 font-black text-6xl text-center my-10">Mi <span className="text-white">Traductor</span> Online</h1>
            <div className="flex justify-center">
                {msg && <Alerta alerta={alerta} />}
            </div>

            <div className="container mx-auto md:grid md:grid-cols-2 mt-10 gap-10 p-5 items-center">

                <div className="mt-20 md:mt-5 shadow-lg px-5 py-10 rounded-xl bg-white">
                    <form onSubmit={handleSubmit} >
                        <div className="my-5">
                            <div className="mb-2 py-0 -mt-10">
                                <label className="uppercase text-gray-600 block text-xl font-bold mb-1">Idioma</label>
                                <select onChange={e => setIdiomaUno(e.target.value)} value={idiomaUno} className="uppercase text-indigo-600 block text-base font-medium" id="idioma1" name="idioma">
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="" defaultValue={''} disabled>Elige tu idioma</option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="en"> English </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="es"> Spanish </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ko"> Korean </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="it"> Italian </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="fr"> French </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ja"> Japanese </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="af"> Afrikaans </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="zh-Hans">Chinese (Simplified) </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="zh-Hant">Chinese (Traditional) </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="nl"> Dutch </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ru"> Russian </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="pt"> Portuguese </option>
                                </select>
                            </div>
                            <label className="uppercase text-gray-600 block text-xl font-bold">
                                Inserta tu texto
                            </label>
                            <textarea onChange={e => setTextoUno(e.target.value)} value={textoUno} className="border w-full p-3 mt-3 bg-gray-50 rounded-xl" placeholder="Hola, mi nombe es traductor..." name="email" />
                        </div>

                        <div className="lg:flex lg:justify-around">
                            <button type="button" onClick={ejecutarSpeechAPI} className=" bg-red-600 w-full py-3 px-10 rounded-2xl text-white font-bold uppercase mt-3 hover:cursor-pointer hover:bg-red-800 md:w-auto">{microfonoState}</button>
                            <button type="button" onClick={() => { detectarIdioma(textoUno) }} className=" bg-green-600 w-full py-3 px-10 rounded-2xl text-white font-bold uppercase mt-3 hover:cursor-pointer hover:bg-green-800 md:w-auto">Detectar</button>
                            <input type="submit" value="Traducir"
                                className=" bg-indigo-700 w-full py-3 px-10 rounded-2xl text-white font-bold uppercase mt-3 hover:cursor-pointer hover:bg-indigo-800 md:w-auto"
                            />
                        </div>

                    </form>
                </div>
                <div className="mt-20 md:mt-5 shadow-lg px-5 py-10 rounded-xl bg-white">
                    {/* {msg && <Alerta alerta={alerta} />} */}
                    <form onSubmit={speak}>
                        <div className="my-5">
                            <div className="mb-2 py-0 -mt-10">
                                <label className="uppercase text-gray-600 block text-xl font-bold mb-2">Idioma</label>
                                <select onChange={e => setIdiomaDos(e.target.value)} defaultValue={'en'} className="uppercase text-indigo-600 block text-base font-medium" id="idioma1" name="idioma">
                                    <option className="uppercase text-indigo-600 block text-base font-medium" disabled>Elige tu idioma</option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="en"> English </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="es"> Spanish </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ko"> Korean </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="it"> Italian </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="fr"> French </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ja"> Japanese </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="af"> Afrikaans </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="zh-Hans">Chinese (Simplified) </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="zh-Hant">Chinese (Traditional) </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="nl"> Dutch </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="ru"> Russian </option>
                                    <option className="uppercase text-indigo-600 block text-base font-medium" value="pt"> Portuguese </option>
                                </select>
                            </div>
                            <label className="uppercase text-gray-600 block text-xl font-bold">
                                Resultado
                            </label>
                            <textarea value={textoDos} className="border w-full p-3 mt-3 bg-gray-50 rounded-xl" placeholder="Hello, my name is translator..." disabled />
                        </div>

                        <input type="submit" value="Escuchar"
                            className="bg-indigo-700 w-full py-3 px-10 rounded-2xl text-white font-bold uppercase mt-3 hover:cursor-pointer hover:bg-indigo-800 md:w-auto"
                        />
                    </form>

                    {/* <nav className="mt-8 lg:flex lg:justify-between">
                        <a className="block text-center my-5 text-gray-500 font-medium hover:underline hover:font-semibold" to="/registrar">¿No tienes una cuenta? Registrate!</a>
                        <a className="block text-center my-5 text-gray-500 font-medium hover:underline hover:font-semibold" to="/olvide-password">Olvide mi password</a>
                    </nav> */}

                </div>
            </div>
        </>
    )
}

export default Formulario