/* @refresh reload */
import { render } from 'solid-js/web'
import 'solid-devtools'

import './index.css'
import App from './App'
import { FlipProvider } from '../../../';

const root = document.getElementById('root')

render(() => <FlipProvider><App /></FlipProvider> , root!)
