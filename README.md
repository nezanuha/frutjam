## Frutjam Useful Prebuilt Plugins & UI Components for TailwindCSS

Frutjam is a powerful library with an array of useful plugins and UI components created exclusively for use with Tailwind CSS. Whether you're creating a web app, a website, or a digital product, Frutjam offers a variety of tools to help you boost your development process and improve user experience. Furthermore, it provides numerous customization options within its plugins, allowing you to design your solutions precisely to your requirements.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Documentations
For detail documentation, visit [frutjam.com](https://frutjam.com)
	
## Key Features:

1. **Tailwind CSS Integration:** Frutjam is designed to work easily with Tailwind CSS, a well-known utility-focused CSS framework. This integration allows you to use the full power of Tailwind's utility classes while also benefiting from Frutjam's additional features.

2. **Useful Plugins:** Frutjam is releasing a number of plugins that will enhance your projects' functionality. These plugins include features like notifications, modals, sliders, form elements, and more. Each plugin is intended to be simple to use, adaptable, and compatible with current web development methods.

3. **UI Components:** In addition to plugins, Frutjam provides an extensive collection of UI components that can be simply integrated into your projects. From navigation menus and cards to buttons and input fields, these components are designed to be accessible, responsive, and visually appealing.

4. **Framework & Libraries Support:** Written in TypeScript, Frutjam supports CommonJS (CJS) and ECMAScript Modules (ESM). It is being developed to support new web frameworks and libraries, such as React, Next.js, Vue, and others.

5. **MIT License:** Frutjam is released under the MIT License, allowing you the freedom to use, alter, and distribute the library as needed for both commercial and personal projects.

Whether you're a beginner exploring web development or an experienced developer looking for efficient tools, Frutjam offers a versatile set of resources to streamline your projects and elevate the user experience.

## Getting started

Whether you're a newbie exploring web development or an experienced developer seeking for efficient tools, Frutjam provides a diverse variety of resources to help you streamline your projects and improve the user experience.

## Installation

You can install Frutjam via npm:

```bash
npm install frutjam
```

## Usage

Import the `Notification` class from Frutjam:

```typescript
import { Notification } from "frutjam";
import "frutjam/dist/notification.css";
```

Create a new notification instance with custom configurations:

```typescript
new Notification({
    effect: "slide",
    escapeTime: 5000,
    autoClose: false,
    arriveFrom: "top",
    element: "<div class='your-customizable-design-class'><button type='button' data-fj='toggle-btn'>Close</button><!-- Add your other elements here --></div>"
});
```

### Configuration Options

- `effect`: Choose between "fade" or "slide" for the notification effect.
- `escapeTime`: Time in milliseconds before the notification automatically closes.
- `arriveTime`: specifies the time in milliseconds after which the notification's arrival animation completes.
- `autoClose`: Boolean to enable or disable automatic closing of the notification.
- `arriveFrom`: Direction from which the notification should arrive ("left", "right", "top", "bottom").
- `element`: Customise your own HTML element to be displayed in the notification.

`<button type='button' data-fj='toggle-btn'>Close</button>` 
To enable manual closing of the current element, set the `data-fj='toggle-btn'` attribute to button.

## License

Frutjam is Open Source project licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Support

For any questions or issues, please [open an issue](https://github.com/nezanuha/frutjam/issues) on GitHub.
