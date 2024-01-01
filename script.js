// function init() {
//     const htmlCode = document.querySelector('textarea#html-code'),
//           cssCode = document.querySelector('textarea#css-code');

//     const iframe = document.querySelector('iframe#content')

//     let iDocument;

//     if ( iframe.contentDocument ) { // FF
//         iDocument = iframe.contentDocument
//     }
//     else if ( iframe.contentWindow ) { // IE
//         iDocument = iframe.contentWindow.document
//     }

//     const htmlHead = iDocument.querySelector('head'),
//           htmlBody = iDocument.querySelector('body'),
//           fragment = document.createDocumentFragment(),
//           newStyle = document.createElement('style');

//     fragment.append(newStyle);
//     htmlHead.append(fragment);

//     const contents = {
//         html: '',
//         css: '',
//     }

//     htmlCode.addEventListener('keyup', change);
//     cssCode.addEventListener('keyup', change);

//     function change() {
//         // Contents
//         if (this.name === 'html-code') {
//             contents['html'] = this.value;
//             htmlBody.innerHTML = this.value;
//         } else if (this.name === 'css-code') {
//             contents['css'] = this.value;   
//             iDocument.querySelector('style').innerHTML = this.value; 
//         }
        
//     }
// }

// const convert = document.querySelector('#convert');
// convert.addEventListener('click', function() {
//     const testCSS = document.querySelector('.test-css');
//     const rules = Array.from(testCSS.sheet.cssRules);
//     const output = [];

//     rules.forEach(rule => {
//         const selector = rule.selectorText;
//         const properties = Array.from(rule.style);

//         // Is it Pseudo
//         let parentElement, 
//             parentFontSize,
//             pseudos = ['::before', '::after', ':hover', ':active', ':focus', ':focus-within', ':focus-visible', ':target', ':visited'] 

//         // Check the pseudo parent font-size then convert all Pixels to EM based on parent font-size
//         if (pseudos.some(pseudo => selector.includes(pseudo))) {
//             const pseudoParentElement = pseudos.map(pseudo => selector.replace(pseudo, ''));
//             parentElement = document.querySelector(pseudoParentElement);
//             parentFontSize = window.getComputedStyle(parentElement, null).getPropertyValue('font-size'); 
//             output.push(compile(px2em(properties, rule, parentFontSize), selector));
//             console.log('Current Iterated: ', selector);
//             console.log(document.querySelector(selector))
//             console.log('The Parent of Current Iterated: ', parentElement);
//         } else {
//             parentElement = document.querySelector(selector).parentElement;
//             parentFontSize = window.getComputedStyle(parentElement, null).getPropertyValue('font-size'); 
//             output.push(compile(px2em(properties, rule, parentFontSize), selector));
//             console.log('Current Iterated: ', selector);
//             console.log('The Parent of Current Iterated: ', parentElement);
//         }
        
//     })

//     display(output);
// })

// function px2em(properties, rule, parentFontSize) {
//     return properties.map(property => {
//         const propertyVariable = property.split('-').map((propertyType, index) => {
//             return index > 0 ? propertyType[0].toUpperCase() + propertyType.slice(1) : propertyType
//         }).join('');
//         const propertyValue = rule.style[propertyVariable];

//         if (property === 'font-size') {
//             if (rule.style[propertyVariable]) {
//                 const parentSize = parseFloat(parentFontSize.replace('px', ''));
//                 const childSize = parseFloat(propertyValue.replace('px', ''))
//                 const emSize = parentSize / childSize;

//                 return `${property}: ${emSize.toFixed(3)}em;`;
//             }
//         } else {
//             if (propertyValue.includes('px')) {
//                 let pseudos = ['::before', '::after', ':hover', ':active', ':focus', ':focus-within', ':focus-visible', ':target', ':visited'];
//                 let isPseudo = pseudos.some(pseudo => rule.selectorText.includes(pseudo)),
//                     pseudoFontSize;
                
//                 if (parseFloat(propertyValue.replace('px', '')) === 0) {
//                     return `${property}: 0;`
//                 }

//                 if (isPseudo) {
//                     let thePseudo = pseudos.filter(pseudo => rule.selectorText.includes(pseudo)).join('');
//                     let thePseudoElement = document.querySelector(rule.selectorText.replace(thePseudo, ''));
//                     pseudoFontSize = window.getComputedStyle(thePseudoElement, thePseudo).getPropertyValue('font-size');
//                 }

//                 const currentSize = parseFloat(propertyValue.replace('px', ''));
//                 const currentFontSize = parseFloat(rule.style.fontSize.replace('px', '')) || pseudoFontSize.replace('px', ''); 
//                 const outputSize = currentSize / currentFontSize;

//                 return `${property}: ${outputSize.toFixed(3)}em;`

//             } else {
//                 return `${property}: ${propertyValue};`
//             }
//         }

//     })
// }

// function compile(converts, selector) {
//     let allProperty = '';
//     converts.forEach(convert => allProperty += `\t ${convert} \n`);
//     return `${selector} { \n ${allProperty} } \n`;
// }

// function display(output) {
//     const outputDisplay = document.querySelector('textarea#test-output');
//     outputDisplay.value = output.join('\n');
// }

// function shorthands() {
    
// }



// NOTE: You must input only static pixel size on your var(--fs-16) to prevent it from changing when converting all px to em. This must be resolved soon.


// Global
let initialViewportWidth, 
    targetViewportWidth = 1600;

// This is where you assigned the stylesheet
const stylesheet = document.querySelector('.test-css');
const stylesheetRules = Array.from(stylesheet.sheet.cssRules);

const pseudoSelectors = ['::before', '::after', ':hover', ':active', ':focus', ':focus-within', ':focus-visible', ':target', ':visited'];

const convertBtn = document.querySelector('#convert');
convertBtn.addEventListener('click', convertPX);

function convertPX(e) {
    const btn = e.currentTarget;

    initialViewportWidth = window.innerWidth;
    window.resizeTo(targetViewportWidth, window.innerHeight);
    
    let rules = []
    stylesheetRules.forEach(styleRule => {
        const styleSelector = styleRule.selectorText;
        const styleSelectorArray = styleSelector.split(',');
        const styleProperties = styleRule.style; 
        
        // Know if the selector has more than selectors
        if (styleSelectorArray.length >= 2) {
            // Know if the the array has one or more pseudo selectors
            if (styleSelectorArray.some(item => pseudoSelectors.some(pseudo => item.includes(pseudo)))) {
                let selector; 
                pseudoSelectors
                    .filter(pseudo => styleSelector.includes(pseudo))
                    .forEach(str => selector = styleSelector.replace(str, '')); 
                
                let convertedEM = convertPX2EM(styleProperties, selector, true);
                let convertedValues = convertValues(convertedEM, styleSelector);
                rules.push(convertedValues);

            } else {

            }

        } else if (!styleProperties.fontSize.includes('var(')) { 
            let convertedEM = convertPX2EM(styleProperties, styleSelector);
            let convertedValues = convertValues(convertedEM, styleSelector);
            rules.push(convertedValues);

        } else {
            rules.push(styleRule.cssText);
        }
    })

    display(rules);
    window.resizeTo(initialViewportWidth, window.innerHeight);
}

function convertPX2EM(properties, selector, isPseudo) {
    const htmlSelector = document.querySelector(selector) || '';
    const selectorProperties = Array.from(properties);
    
    let selectorParent, selectorParentFS, selectorParentCS, pseudoFS;
    
    if (htmlSelector) {
        selectorParent = htmlSelector.parentElement;
        selectorParentCS = window.getComputedStyle(selectorParent, null);
        selectorParentFS = selectorParentCS.getPropertyValue('font-size');
    }

    if (pseudoSelectors.some(pseudo => selector.includes(pseudo))) {
        if (isPseudo) {
            selectorParent = htmlSelector;
            selectorParentFS = window.getComputedStyle(selectorParent, null).getPropertyValue('font-size'); 
            console.log(selectorParent)
        } else {
            let selectorPseudo = pseudoSelectors.filter(pseudo => selector.includes(pseudo)).join('');
            let selectorPseudoElement = document.querySelector(selector.replace(selectorPseudo, ''));
            pseudoFS = window.getComputedStyle(selectorPseudoElement, selectorPseudo).getPropertyValue('font-size');
        }
    }

    return selectorProperties.map(property => {
        const name = property.split('-').map((type, index) => index > 0 ? type[0].toUpperCase() + type.slice(1) : type).join('');
        const value = properties[name];
        let pSize, cSize, elSize, elFSSize, em;

        if (property === 'font-size' && value) {
            pSize = parseFloat(selectorParentFS.replace('px', ''));
            cSize = parseFloat(value.replace('px', ''));
            em = cSize / pSize;

            return `${property}: ${Number.parseFloat(em.toFixed(3))}em;`;
            
        } else if (value.includes('px')){
            elSize = parseFloat(value.replace('px', ''));
            elFSSize = parseFloat(properties.fontSize.replace('px', '')) || pseudoFS.replace('px', '');
            em = elSize / elFSSize;

            return `${property}: ${Number.parseFloat(em.toFixed(3))}em;`;

        } else {
            return `${property}: ${value};`
        }
    })
}

function convertValues(properties, selector) {
    let allProperty = '';
    properties.forEach(property => allProperty += `\t ${property} \n`);
    return `${selector} { \n ${allProperty} } \n`;
}

function display(output) {
    const outputDisplay = document.querySelector('textarea#test-output');
    outputDisplay.value = output.join('\n');
}