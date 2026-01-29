export function validateNickname(nickname: string) {
  const n = nickname.trim();

  if (n.length < 2 || n.length > 9) {
    return "닉네임은 2자 이상 9자 이하로 입력해주세요.";
  }

  const regExp = /^[a-zA-Z0-9가-힣]+$/;
  if (!regExp.test(n)) {
    return "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.";
  }

  if (/\s/.test(n)) {
    return "닉네임에 공백을 사용할 수 없습니다.";
  }

  const forbiddenCharacters = /[ㄱ-ㅎㅏ-ㅣ]/;
  if (forbiddenCharacters.test(n)) {
    return "자모음만으로 구성된 닉네임은 사용할 수 없습니다.";
  }

  if (n === "saerok" || n === "새록") {
    return "사용할 수 없는 닉네임입니다.";
  }

  return null;
}
