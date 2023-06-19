type MODULE = typeof import("./index"); // eslint-disable-line
type BAR = MODULE["TEST"];
type useApplication = MODULE["useApplication"];
