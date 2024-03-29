import { Label } from '3oilerplate'
import { Check as CheckIcon, X as XIcon } from 'react-feather'

export function SelectionLabel({ children, onClick, active }: any) {
  return (
    <Label sRef="Label" s={{ mb: 's', mr: 's', '> *': { mr: 'xs' } }} isSelection isSelected={active} onClick={onClick}>
      { active ? <CheckIcon size="16" /> : <XIcon size="16" />}
      <p>{ children }</p>
    </Label>
  )
}
