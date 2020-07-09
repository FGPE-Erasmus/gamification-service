export function generatePassword(length: number): string {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeric = '0123456789';
  const special = '!$^&*-=+_?';

  const options = [alpha, caps, numeric, special];

  let password = '';
  const passwordArray = Array(length);

  for (let i = 0; i < length; i++) {
    const currentOption = options[Math.floor(Math.random() * options.length)];
    const randomChar = currentOption.charAt(Math.floor(Math.random() * currentOption.length));
    password += randomChar;
    passwordArray.push(randomChar);
  }

  checkPassword();

  function checkPassword() {
    let missingValueArray = [];
    let containsAll = true;

    options.forEach(function(e, _i, a) {
      let hasValue = false;
      passwordArray.forEach(function(e1) {
        if (e.indexOf(e1) > -1) {
          hasValue = true;
        }
      });

      if (!hasValue) {
        missingValueArray = a;
        containsAll = false;
      }
    });

    if (!containsAll) {
      passwordArray[Math.floor(Math.random() * passwordArray.length)] =
        missingValueArray[Math.floor(Math.random() * missingValueArray.length)];
      password = '';
      passwordArray.forEach(function(e) {
        password += e;
      });
      checkPassword();
    }
  }

  return password;
}
