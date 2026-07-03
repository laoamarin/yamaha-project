import {
  getCertificateDisplayName,
  parseCertificateNameField,
  stripHonorificPrefix,
} from "../src/lib/certificate-name";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function testGetCertificateDisplayName() {
  const thaiStudent = {
    full_name: "ด.ช.สมชาย ใจดี",
    nickname: "ชาย",
  };

  assert(
    getCertificateDisplayName(thaiStudent) === "ด.ช.สมชาย ใจดี",
    "default full_name"
  );
  assert(
    getCertificateDisplayName(thaiStudent, "no_prefix") === "สมชาย ใจดี",
    "event default no_prefix"
  );
  assert(
    getCertificateDisplayName(
      { ...thaiStudent, certificate_name_source: "nickname" },
      "full_name"
    ) === "ชาย",
    "student override nickname"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.Athena Hongsuok",
      nickname: "Athena",
      certificate_name_source: "no_prefix",
    }) === "Athena Hongsuok",
    "no_prefix strips honorific"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.MYRA NARANG",
      certificate_name_source: "custom",
      certificate_name: "MYRA NARANG",
    }) === "MYRA NARANG",
    "custom name"
  );
  assert(
    getCertificateDisplayName({
      full_name: "ด.ญ.Test",
      extra_data: { english_name: "MYRA NARANG" },
      certificate_name_source: "english_name",
    }) === "MYRA NARANG",
    "custom import field"
  );
}

function testParseCertificateNameField() {
  assert(parseCertificateNameField("nickname") === "nickname", "english");
  assert(parseCertificateNameField("ชื่อเล่น") === "nickname", "thai");
  assert(parseCertificateNameField("no_prefix") === "no_prefix", "no_prefix");
  assert(parseCertificateNameField("") === null, "empty");
  assert(parseCertificateNameField("english_name") === "english_name", "custom field key");
}

function testStripHonorificPrefix() {
  assert(
    stripHonorificPrefix("ด.ญ.Athena Hongsuok") === "Athena Hongsuok",
    "ด.ญ."
  );
  assert(stripHonorificPrefix("นายทดสอบ ระบบ") === "ทดสอบ ระบบ", "นาย");
  assert(stripHonorificPrefix("MYRA NARANG") === "MYRA NARANG", "no prefix");
}

function main() {
  testStripHonorificPrefix();
  testParseCertificateNameField();
  testGetCertificateDisplayName();
  console.log("✓ certificate-name smoke tests passed");
}

main();
