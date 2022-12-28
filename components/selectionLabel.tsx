import { Label } from '3oilerplate'
import { Check as CheckIcon, X as XIcon } from 'react-feather'

export default function SelectionLabel({ children, onClick, selected }: any) {
  return (
    <Label sRef="Label" s={{ mb: 's', mr: 's', '> *': { mr: 'xs' } }} isSelected={selected} onClick={onClick}>
      { selected ? <CheckIcon size="16" /> : <XIcon size="16" />}
      <span>{ children }</span>
    </Label>
  )
}
