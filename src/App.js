import React, { useState, useEffect } from 'react'
import './styless.css'
import axios from 'axios'
import { BsFillInfoCircleFill } from 'react-icons/bs'

const App = () => {

  const [inputInfo, setInputInfo] = useState({
    cotacao: '',
    quantidade: '',
    dataCotacao: '',
    errorMsgCot: '',
    errorMsgQuant: ''
  })

  const [converted, setConverted] = useState(false)

  const resultInfo = () => {
    const result = parseFloat(parseFloat(inputInfo.quantidade) * parseFloat(inputInfo.cotacao)).toFixed(2)
    const resultFormated = result.replace(/(?=(\d{3})+(\D))\B/g, ".")
    return resultFormated
  }

  const handleChange = (evt) => {
    let values = evt.target.value;
    values = values.replace(/\D/g, "")
    values = values.replace(/(\d)(\d{2})$/, "$1,$2");
    const key = evt.target.name
    setInputInfo(old => ({
      ...old,
      [key]: values
    }))
  }

  const newDate = (decrement) => {
    const date = new Date()
    date.setDate(date.getDate() - decrement)
    const dateFormated = (date.getMonth() + 1) + '-' + (date.getDate()) + '-' + (date.getFullYear())
    return dateFormated
  }

  useEffect(() => {
    let decrement = 0

    const run = async () => {
      let data = newDate(decrement)
      let api = axios.create({ baseURL: `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao=%27${data}%27&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao` })
      let res = await api.get()
      let dataSplit = data.split('-')
      let dataBrFormat = dataSplit[1] + '/' + dataSplit[0] + '/' + dataSplit[2]
      if (res.data.value[0] !== undefined) {
        setInputInfo(old => ({
          ...old,
          cotacao: parseFloat(res.data.value[0].cotacaoVenda),
          dataCotacao: dataBrFormat
        }))
      } else {
        while (res.data.value[0] === undefined) {
          decrement++
          data = newDate(decrement)
          api = axios.create({ baseURL: `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao=%27${data}%27&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao` })
          res = await api.get()
          dataSplit = data.split('-')
          dataBrFormat = dataSplit[1] + '/' + dataSplit[0] + '/' + dataSplit[2]
          if (res.data.value[0] !== undefined) {
            setInputInfo(old => ({
              ...old,
              cotacao: parseFloat(res.data.value[0].cotacaoVenda),
              dataCotacao: dataBrFormat
            }))
          } else {
            setInputInfo(old => ({
              ...old,
              cotacao: '',
              dataCotacao: 'Cotação indisponível'
            }))
          }
        }
      }
    }
    run()

  }, [])

  const converter = (evt) => {
    evt.preventDefault()
    if (inputInfo.cotacao === '') {
      setInputInfo(old => ({
        ...old,
        errorMsgCot: 'Este campo é de preenchimento obrigatório.'
      }))
    } else if (inputInfo.quantidade === '') {
      setInputInfo(old => ({
        ...old,
        errorMsgQuant: 'Este campo é de preenchimento obrigatório.'
      }))
    } else {
      setConverted(!converted)
    }
  }

  const handleKeyUpCot = (evt) => {
    if (evt.target.value !== '') {
      setInputInfo(old => ({
        ...old,
        errorMsgCot: ''
      }))
    } else {
      return
    }
  }

  const handleKeyUpQuant = (evt) => {
    if (evt.target.value !== '') {
      setInputInfo(old => ({
        ...old,
        errorMsgQuant: ''
      }))
    } else {
      return
    }
  }

  const handleBlurCot = (evt) => {
    if (evt.target.value === '') {
      setInputInfo(old => ({
        ...old,
        errorMsgCot: 'Este campo é de preenchimento obrigatório.'
      }))
    } else {
      return
    }
  }

  const handleBlurQuant = (evt) => {
    if (evt.target.value === '') {
      setInputInfo(old => ({
        ...old,
        errorMsgQuant: 'Este campo é de preenchimento obrigatório.'
      }))
    } else {
      return
    }
  }

  return (
    <div id='container-app'>
      <div className='wrapper-app' id={converted === false ? 'first-element' : 'first-element-after'}>
        <form id={converted === false ? 'form-element' : 'form-element-after'}>
          <label className='label-element'>Cotação:</label>
          <div className='span-input-div'>
            <span>$</span>
            <input onBlur={handleBlurCot} onKeyUp={handleKeyUpCot} onChange={handleChange} type='string' required placeholder='9,99' name='cotacao' className='input-element' id='input-cotacao' value={inputInfo.cotacao}></input>
          </div>
          {inputInfo.errorMsgCot !== '' && <p className='error-message'>{inputInfo.errorMsgCot}</p>}
          <label className='label-element'>Quantidade de Dólar:</label>
          <div className='span-input-div'>
            <span>$</span>
            <input onBlur={handleBlurQuant} onKeyUp={handleKeyUpQuant} onChange={handleChange} type='string' required placeholder='9.999,99' name='quantidade' className='input-element' id='input-quantidade' value={inputInfo.quantidade}></input>
          </div>
          {inputInfo.errorMsgQuant !== '' && <p className='error-message'>{inputInfo.errorMsgQuant}</p>}
          <div id='btn-wrapper'>
            <button type='submit' onClick={converter}>CONVERTER</button>
          </div>
          <p id='info-p'><span id='info-icon'><BsFillInfoCircleFill /></span> Data da última cotação disponível: <span id='data-info'>{inputInfo.dataCotacao}</span> </p>
        </form>
        <img src='./logotipo.png' alt='logotipo-left' id={converted === false ? 'logotipo-left-hide' : 'logotipo-left-show'}></img>
      </div>
      <div className='wrapper-app' id={converted === false ? 'second-element' : 'second-element-after'}>
        <img src='./logotipo.png' alt='logotipo-right' id={converted === false ? 'logotipo-right-show' : 'logotipo-right-hide'}></img>
        <p id={converted === false ? 'result-info' : 'result-info-after'} ><b> $ {inputInfo.quantidade}</b> dólares na cotação de <b>$ {inputInfo.cotacao} </b> é igual a: <br /> <span> R$ {resultInfo()}</span></p>
        <button id={converted === false ? 'reconvert-btn' : 'reconvert-btn-after'} onClick={converter}>VOLTAR</button>
      </div>

    </div >
  )
}

export default App;
