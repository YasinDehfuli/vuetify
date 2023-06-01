// Styles
import './VDateCard.sass'

// Components
import { makeVDatePickerControlsProps, VDatePickerControls } from './VDatePickerControls'
import { makeVDatePickerMonthProps, VDatePickerMonth } from './VDatePickerMonth'
import { makeVDatePickerYearsProps, VDatePickerYears } from './VDatePickerYears'
import { VBtn } from '@/components/VBtn'
import { VCard, VCardSlots } from '@/components/VCard/VCard'
import { VSpacer } from '@/components/VGrid'

// Composables
import { createDatePicker } from './composables'
import { useLocale } from '@/composables/locale'
import { useProxiedModel } from '@/composables/proxiedModel'
import { makeTransitionProps, MaybeTransition } from '@/composables/transition'

// Utilities
import { genericComponent, propsFactory, useRender } from '@/util'

// Types
import type { PropType } from 'vue'

export const makeVDateCardProps = propsFactory({
  cancelText: {
    type: String,
    default: '$vuetify.datePicker.cancel'
  },
  okText: {
    type: String,
    default: '$vuetify.datePicker.ok'
  },
  inputMode: {
    type: String as PropType<'keyboard' | 'calendar'>,
    default: 'calendar',
  },
  hideActions: Boolean,

  ...makeVDatePickerControlsProps(),
  ...makeVDatePickerMonthProps(),
  ...makeVDatePickerYearsProps(),
  ...makeTransitionProps({ transition: 'fade' }),
}, 'VDateCard')

export const VDateCard = genericComponent<VCardSlots>()({
  name: 'VDateCard',

  props: makeVDateCardProps(),

  emits: {
    'update:displayDate': (value: any) => true,
    'update:inputMode': (value: any) => true,
    'update:modelValue': (value: any) => true,
    'update:viewMode': (mode: 'month' | 'year') => true,
  },

  setup (props, { emit, slots }) {
    const model = useProxiedModel(props, 'modelValue')
    const { t } = useLocale()

    createDatePicker(props)

    function onDisplayUpdate (val: any) {
      emit('update:displayDate', val)
    }

    function onViewModeUpdate (val: any) {
      emit('update:viewMode', val)
    }

    useRender(() => {
      const [cardProps] = VCard.filterProps(props)
      const [datePickerControlsProps] = VDatePickerControls.filterProps(props)
      const [datePickerMonthProps] = VDatePickerMonth.filterProps(props)
      const [datePickerYearsProps] = VDatePickerYears.filterProps(props)
      const hasActions = !props.hideActions || !!slots.actions

      return (
        <VCard
          { ...cardProps }
          class="v-date-card"
        >
          {{
            ...slots,
            default: () => (
              <>
                <VDatePickerControls
                  key="picker-controls"
                  { ...datePickerControlsProps }
                  onUpdate:displayDate={ onDisplayUpdate }
                  onUpdate:viewMode={ onViewModeUpdate }
                />

                <MaybeTransition transition={ props.transition } mode="out-in">
                  { props.viewMode === 'month' ? (
                    <VDatePickerMonth
                      key="picker-month"
                      { ...datePickerMonthProps }
                      v-model={ model.value }
                      onUpdate:displayDate={ onDisplayUpdate }
                    />
                  ) : (
                    <VDatePickerYears
                      key="picker-years"
                      { ...datePickerYearsProps }
                      onUpdate:displayDate={ onDisplayUpdate }
                      onUpdate:viewMode={ onViewModeUpdate }
                    />
                  )}
                </MaybeTransition>
              </>
            ),
            actions: !hasActions ? undefined : (() => (
              <>
                { slots.actions?.() ?? (
                  <>
                    <VSpacer />
                    <VBtn text={ t(props.cancelText) } />
                    <VBtn text={ t(props.okText) } />
                  </>
                )}
              </>
            )),
          }}
        </VCard>
      )
    })

    return {}
  },
})

export type VDateCard = InstanceType<typeof VDateCard>
