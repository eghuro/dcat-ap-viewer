import React from "react";
import {mount, default as Enzyme} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import SeachBox from "./search-box";

Enzyme.configure({"adapter": new Adapter()});

const noop = () => {
};

describe("Search box", () => {

  function createComponent(userProps = {}) {
    const props = {
      "defaultValue": "",
      "onSearch": noop,
      "query": {},
      ...userProps,
    };
    return mount(<SeachBox {...props} />);
  }

  it("Renders component.", () => {
    const component = createComponent();
    //
    expect(component.find("i")).toHaveLength(1);
    expect(component.find("input.form-control")).toHaveLength(1);
    expect(component.find("button")).toHaveLength(1);
    //
    component.unmount();
  });

  it("Render default value.", () => {
    const expectedValue = "init-value";
    const component = createComponent({"defaultValue": expectedValue});
    const actualValue = component.find("input.form-control").props().value;
    //
    expect(actualValue).toBe(expectedValue);
    //
    component.unmount();
  });

  it("Search by suggested value and enter.", () => {
    const onSearch = jest.fn();
    const searchValue = "vts";
    const component = createComponent({"onSearch": onSearch});
    const inputComponent = component.find("input.form-control");
    // These are actually ignored.
    inputComponent.simulate("keyDown", {"keyCode": "86"});
    inputComponent.simulate("keyDown", {
      "key": "Enter",
      "target": {"value": searchValue},
    },
    );
    //
    expect(onSearch.mock.calls).toHaveLength(1);
    expect(onSearch.mock.calls[0][0]).toBe(searchValue);
    //
    component.unmount();
  });

});