import DefaultTheme from 'vitepress/theme'
import './style/theme.css'
import './style/custom.css'
import './tailwind.postcss'

import Layout from './Layout.vue'
import LogsourceBox from "./components/Boxes/LogsourceBox.vue";
import RulesBox from "./components/Boxes/RulesBox.vue";
import TargetBox from "./components/Boxes/TargetBox.vue";
import Callout from "./components/Callout.vue";

export default {
    extends: {
        ...DefaultTheme,
        Layout
    },
    enhanceApp(ctx) {
        ctx.app.component('LogsourceBox', LogsourceBox)
        ctx.app.component('RulesBox', RulesBox)
        ctx.app.component('TargetBox', TargetBox)

        ctx.app.component('Callout', Callout)
    }
}


