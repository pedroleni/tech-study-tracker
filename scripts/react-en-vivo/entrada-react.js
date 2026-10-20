import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as JsxRuntime from 'react/jsx-runtime'
import * as JsxDevRuntime from 'react/jsx-dev-runtime'

globalThis.__reactEnVivo = { React, ReactDOM, ReactDOMClient, JsxRuntime, JsxDevRuntime }
