import { initials } from '../../utils/constants';

export default function Avatar({ name, overloaded = false, small = false }) {
  return (
    <span className={`avatar ${small ? 'avatar-small' : ''} ${overloaded ? 'avatar-overloaded' : ''}`} title={name}>
      {initials(name)}
    </span>
  );
}
