// Components
import { VDivider } from '../VDivider'
import { filterListGroupProps, VListGroup } from './VListGroup'
import { VListItem } from './VListItem'

// Composables
import { useLocale } from '@/composables'

// Utilities
import { createList } from './list'
import { genericComponent } from '@/util'

// Types
import type { Prop } from 'vue'
import type { MakeSlots } from '@/util'
import type { ListGroupActivatorSlot } from './VListGroup'
import type { ListItemSubtitleSlot, ListItemTitleSlot } from './VListItem'
import type { InternalListItem } from './VList'

export type ListItemSlot<T> = {
  item: InternalListItem<T>
  props: InternalListItem<T>['props']
  index: number
}

export const VListChildren = genericComponent<new <T>() => {
  $props: {
    items?: InternalListItem<T>[]
  }
  $slots: MakeSlots<{
    default: []
    header: [ListGroupActivatorSlot & { item: InternalListItem<T> }]
    item: [ListItemSlot<T>]
    title: [ListItemTitleSlot]
    subtitle: [ListItemSubtitleSlot]
  }>
}>()({
  name: 'VListChildren',

  props: {
    items: Array as Prop<InternalListItem<any>[]>,
    noDataText: {
      type: String,
    },
  },

  setup (props, { slots }) {
    const { t } = useLocale()
    createList()

    return () => {
      if (slots.default) return slots.default()

      if (!props.items?.length && props.noDataText) {
        return slots['no-data']?.({ noDataText: props.noDataText }) ?? <VListItem title={ t(props.noDataText) } />
      }

      return props.items?.map((internalItem, index) => {
        const { children, props: itemProps, type, raw: item } = internalItem

        if (type === 'divider') {
          return slots.divider?.({ props: itemProps }) ?? (
            <VDivider { ...itemProps } />
          )
        }

        const slotsWithItem = {
          subtitle: slots.subtitle ? (slotProps: any) => slots.subtitle?.({ ...slotProps, item }) : undefined,
          prepend: slots.prepend ? (slotProps: any) => slots.prepend?.({ ...slotProps, item }) : undefined,
          append: slots.append ? (slotProps: any) => slots.append?.({ ...slotProps, item }) : undefined,
          default: slots.default ? (slotProps: any) => slots.default?.({ ...slotProps, item }) : undefined,
          title: slots.title ? (slotProps: any) => slots.title?.({ ...slotProps, item }) : undefined,
        }

        const [listGroupProps, _1] = filterListGroupProps(itemProps as any)

        return children ? (
          <VListGroup
            value={ itemProps?.value }
            { ...listGroupProps }
          >
            {{
              activator: ({ props: activatorProps }) => slots.header
                ? slots.header({ item: internalItem, props: { ...itemProps, ...activatorProps } })
                : <VListItem { ...itemProps } { ...activatorProps } v-slots={ slotsWithItem } />,
              default: () => (
                <VListChildren
                  items={ children }
                  v-slots={ slots }
                />
              ),
            }}
          </VListGroup>
        ) : (
          slots.item ? slots.item({ item: internalItem, props: itemProps, index }) : (
            <VListItem
              { ...itemProps }
              v-slots={ slotsWithItem }
            />
          )
        )
      })
    }
  },
})
