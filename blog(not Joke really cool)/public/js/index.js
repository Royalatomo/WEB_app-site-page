// jshint esversion:6

window.onload = () => {
    // Checks If A Blog loded:-
    let element = document.getElementById('content-render');
    if (element !== null){
        // Converts text to html
        makeContentHtml();
    }
};

// Validate file extention
checkExtention = () => {
    // get input with name img
    let extention = document.getElementsByName('img')[0].value;
    // here text is put if extention is wrong
    let text = document.getElementById('img-text');
    // Getting Extention
    extention = extention.split('.');
    extention = extention[extention.length - 1];

    // Checking if extention not Png or Jpg or Jpeg
    if (extention !== "png" || extention !== "jpg" || extention !== "jpeg") {
        // Add this html to img-text
        text.innerHTML = `<p>PNG, JPG and JPEG Files Are Supported</p>`;
        // adding css classes
        text.classList = ['extention red-color'];
        
        // Changing submit button's color and disabling it
        document.getElementsByName('submit-button')[0].classList = ['red-button'];
        document.getElementsByName('submit-button')[0].disabled = true;

    }
    // Checking if extention is Png or Jpg or Jpeg
    if (extention === "png" || extention === "jpg" || extention === "jpeg") {
        // Adding nothing to html of img-text
        text.innerHTML = ``;
        // removing classes if any
        text.classList = [''];
        
        // Changing submit button's color and enabling it
        document.getElementsByName('submit-button')[0].disabled = false;
        document.getElementsByName('submit-button')[0].classList = ['blue-button'];
    }
};


// Checking password and confirm password is same
checkPassword = () => {

    // If Password and Confirm-Password both are same
    if (document.getElementsByName('password')[0].value === document.getElementsByName('confirm-password')[0].value) {
        // Changing submit button's color
        document.getElementsByName('submit-button')[0].classList = ['blue-button'];
        // Removing If Any Message is there previously
        document.getElementById('pass-message').innerText = "";
        // Enabling Submit Button
        document.getElementsByName('submit-button')[0].disabled = false;
    } 
    // If Password and Confirm-Password doesn't match
    else {
        // Changing Submit Button's Color
        document.getElementsByName('submit-button')[0].classList = ['red-button'];
        // Adding css class to message box
        document.getElementById('pass-message').classList = ['red-color'];
        // Adding Message to message box
        document.getElementById('pass-message').innerText = "Password and Confirm Password Doesn't Match";
        // Disabling submit button
        document.getElementsByName('submit-button')[0].disabled = true;
    }
};


// This will limit the title of a blog's length
checkLength = () => {
    // Updating the Character Left Message Box
    document.getElementsByClassName('maxlength')[0].innerText = 40 - document.getElementsByName('title')[0].value.length;
};


// This will limit the Name user can register with
checkNameLength = () => {
    // User can only write upto 30 characters
    document.getElementsByName('full-name')[0].value = document.getElementsByName('full-name')[0].value.slice(0, 30);
};


// Getting Selected Text And Its position For Styling the blog
getSelectedText = () => {
    let text = ''; // This will store the selected Text
    let activeArea = document.activeElement.name; // This Contain the current active area
    let startEnd = ''; // Stores the Starting and ending position of selected Text
    
    // If ActiveArea Is TextArea
    if (activeArea === "content") {

        // If No Error Occurs
        if (document.getSelection) {
            // Saving selected text
            text = document.getSelection().toString();
            // Saving selected text position
            startEnd = getSelectedIndex(document.getElementsByName('content')[0]);
        } else {
            // If Some Error Occurs
            if (document.selection) {
                // Save selected text differently
                text = document.selection.createRange();
                // Saving Selected text position
                startEnd = getSelectedIndex(document.getElementsByName('content')[0]);
            }
        }
    }

    // Checking if above process is success full
    if (startEnd !== '') {
        // returing the data
        return [text, startEnd[0], startEnd[1]];
    }
    
    // If Above process failed somehow
    else {
        // returing nothing
        return '';
    }
};


// Selected Item Position (getSelectedText() helper function)
getSelectedIndex = (element) => {
    // Storing the Starting position of the selected text
    let startPos = element.selectionStart;
    // Storing the Ending position of the selected text
    let endPos = element.selectionEnd;
    
    let selectedText = element.value.substring(startPos, endPos);
    if (selectedText.length <= 0) {
        return; // stop here if selection length is <= 0
    }
    // return the selection
    return [startPos, endPos];
};



// This will produce FormatedTxt(with Html), NormalTxt(Without Html)
duplicateTxtArea = () => {
    let txt = []; // Storing FormatedTxt
    // Getting Value From TextArea
    let html = document.getElementsByName('content')[0].value;
    document.getElementsByName('realContent')[0].value = html;

    let normalContent = document.getElementsByName('normalContent')[0]; // Storing NormalTxt
    // Convert New line to <br> tags
    html = html.split('\n').join('<br>');
    
    // Storing FormatedTxt to NormalTxt
    normalContent.value = html;
    
    // Remove these words from NormalTxt
    let rmWord = ["<br>", "+b-", "+i-", "+u-", "+l-", "+c-", "+r-", "+\\-", "+\\\\-", "$\\$"];
    for (let i of rmWord){
        normalContent.value = String(normalContent.value).split(i).join('');
    }

    // Removing < and / so that user cannot add his own html tags (Security)
    for (let i = 0; i < html.length; i++) {

        // Removing <
        if (html[i] == "<") {
            if (html.slice(i, i + 4) == "<br>") {
                txt.push(html[i]);
            }
        } 
        // Removing /
        else if (html[i] !== "/") {
            txt.push(html[i]);
        }
    }

    // Converting FormatedTxt to string from list
    html = txt.join('');

    // Chaning custom tags to html tags
    html = html.split('+b-').join('<span class="bold">'); // Bold
    html = html.split('+i-').join('<span class="italic">'); // Italic
    html = html.split('+u-').join('<span class="underline">'); // underline
    html = html.split('+l-').join('<div class="text-left">'); // left align
    html = html.split('+c-').join('<div class="text-center">'); // center align
    html = html.split('+r-').join('<div class="text-right">'); // right align
    
    // Getting Number between 1-10
    for (let i = 0; i < "1234567890".length; i++) {
        // Removing Font-Size Tags if any(NormalTxt)
        normalContent.value = String(normalContent.value).split(`$${i+1}$`).join('');
        // Adding Font-Size Tags if any custom tag present(FormatedTxt)
        html = html.split(`$${i+1}$`).join(`<span style="font-size: ${i+1}vh">`);
    }

    // Chaning custom Ending tags to html Ending tags
    html = html.split('+\\-').join('</span>');
    html = html.split('+\\\\-').join('</div>');
    html = html.split(`$\\$`).join('</span>');

    // Adding FormatedTxt to Format Div InnerHTML
    document.getElementsByClassName('textarea')[0].innerHTML = html;
    
};


// This will add cutom styling tags to text
textStyle = (decoration) => {
    let TSE = getSelectedText(); // Stores selected text, position
    let txt = document.getElementsByName('content')[0]; // User writable textarea
    let newText = []; // Stores the txt with custom tags
    for (let i = 0; i < txt.value.length + 1; i++) {
        if (i === TSE[1]) {

            // Adding custom starting tags based of option
            switch (decoration) {
                case 'b':
                    // Bold
                    newText.push(`+b-${txt.value[i]}`);
                    break;
                case 'i':
                    // Italic
                    newText.push(`+i-${txt.value[i]}`);
                    break;
                case 'u':
                    // Underline
                    newText.push(`+u-${txt.value[i]}`);
                    break;
                case 'l':
                    // Left Align
                    newText.push(`+l-${txt.value[i]}`);
                    break;
                case 'c':
                    // Center Align
                    newText.push(`+c-${txt.value[i]}`);
                    break;
                case 'r':
                    // Right Align
                    newText.push(`+r-${txt.value[i]}`);
                    break;
                case 's':
                    // Font-Size
                    newText.push(`$2$${txt.value[i]}`);
                    break;
            }
        }
        // Adding custom Ending tags based of option
        else if (i === TSE[2]) {

            // If The Txt.value's selected text ending position is not empty
            if (String(txt.value[i]) !== "undefined") {

                // If Option is c or l or r
                if (decoration === 'c' || decoration === 'l' || decoration === 'r') {
                    // Adding Cutom tag + next character
                    newText.push(`+\\\\-${txt.value[i]}`);
                }
                // If Option is s
                else if (decoration === 's') {
                    // Adding Cutom tag + next character
                    newText.push(`$\\$${txt.value[i]}`);
                }
                // If Option is Something other than above
                else {
                    // Adding Cutom tag + next character
                    newText.push(`+\\-${txt.value[i]}`);
                }

            }
            // If The Txt.value's selected text ending position is empty
            else {

                // If Option is c or l or r
                if (decoration === 'c' || decoration === 'l' || decoration === 'r') {
                    // Adding Cutom tag only
                    newText.push(`+\\\\-`);
                }
                // If Option is s
                else if (decoration === 's') {
                    // Adding Cutom tag only
                    newText.push(`$\\$`);
                }
                // If Option is Something other than above
                else {
                    // Adding Cutom tag only
                    newText.push(`+\\-`);
                }
            }
        }
        // This this word is not selected than added without any custom tags
        else {
            newText.push(txt.value[i]);
        }
    }

    // Joining all the text together in a string
    txt.value = newText.join('');
    
    // Copying text to other Areas (FormatedTxt, NormalTxt)
    duplicateTxtArea();
};


makeContentHtml = () => {
    // This is convert text content to html content of <p> tag (content-render)
    document.getElementById('content-render').innerHTML = document.getElementById('content-render').innerText;
};
