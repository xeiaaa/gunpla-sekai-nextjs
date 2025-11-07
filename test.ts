function cleanKitName(
  name: string,
  vendorSlug: string,
  productLineSlug: string
) {
  if (vendorSlug !== "bandai") {
    return name;
  }

  const lower = name.toLowerCase();
  let cleanName = "";

  // Rule 1: if name contains "&" or ",", return original
  if (name.includes("&") || name.includes(",")) {
    cleanName = name;
  }

  // Rule 2: if name is 1 word only, return original
  if (!name.includes(" ")) {
    cleanName = name;
  }

  // Rule 3: if name contains "rx-78-2", return original
  if (lower.includes("rx-78-2")) {
    cleanName = name;
  }

  const parts = name.trim().split(" ");
  const first = parts[0];

  console.log(parts, first);

  // Rule 4: match model-like prefixes (letters + dash + alphanumeric, possibly multiple dashes)
  // Examples matched: RX-78GP01-Fb, ZGMF-X10A, GN-0000+GNR-010
  const isMobileCode = (first: string) => {
    return first.includes("-") && /.*\d.*/.test(first);
  };
  console.log("is mobile code", isMobileCode(first));
  if (isMobileCode(first)) {
    cleanName = parts.slice(1).join(" ").trim();
  } else {
    cleanName = name;
  }

  const productLineMap = {
    "old-hg": "HG",
    "mg-ver-ka": "MG",
    "mgex-ver-ka": "MGEX",
    "re-100": "RE/100",
  };

  let productLinePrefix = "";
  if (productLineSlug?.startsWith("ng")) {
    productLinePrefix = "";
  } else {
    if (productLineMap[productLineSlug]) {
      productLinePrefix = productLineMap[productLineSlug];
    } else {
      productLinePrefix = productLineSlug.toUpperCase();
    }
  }

  if (name === "RX-0(N) Unicorn Gundam 02 Banshee Norn") {
    console.log(productLinePrefix);
  }

  if (productLinePrefix) {
    return `${productLinePrefix.toUpperCase()} ${cleanName}`;
  } else {
    return cleanName;
  }
}

console.log(cleanKitName("Unicorn Gundam Perfectibility", "bandai", "pg"));
