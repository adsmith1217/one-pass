/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Cordova Standard Included Init Functions
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

// App initialization, custom JS
app.initialize();

// Create master password
var onepass = "";

// Helper text is user has not created an account yet
if(localStorage.getItem("hashed1pass") === null)
{
    localStorage.setItem('hint', "IMPORTANT: Once this password is set it cannot be changed.");
}

// Store master password
function store_onepass()
{
    onepass = document.getElementById("master_password").value;

    // Prompt if user enters blank input
    if(onepass == "")
    {
        navigator.notification.alert("Please enter your 1Pass.");
        return;
    }

    // Password maximum
    if(onepass.length >= 20)
    {
        navigator.notification.alert("Your password must be 20 characters or less."); 
        return; 
    }

    // Password minimum
    if(onepass.length < 8)
    {
        navigator.notification.alert("Your password must be more than 8 characters");
        return;
    }

    // Password includes numbers
    re = /[0-9]/;
    if(!re.test(onepass))
    {
        navigator.notification.alert("Your password must contain numbers");
        return;
    }

    // Password includes lowercase letters
    re = /[a-z]/;
    if(!re.test(onepass))
    {
        navigator.notification.alert("Your password must contain at least one lowercase letter");
        return;
    }

    // Password includes uppercase letters
    re = /[A-Z]/;
    if(!re.test(onepass))
    {
        navigator.notification.alert("Your password must contain at least one uppercase letter");
        return;
    }

    // Password includes special characters
    re = /[!@#$%^&*]/;
    if(!re.test(onepass))
    {
        navigator.notification.alert("Your password must contain at least one special character")
        return;
    }

    // Hash given password
    var onepass_hash = CryptoJS.MD5(onepass);

    // New user who has never logged in before, so we need to add their password
    if(localStorage.getItem("hashed1pass") === null)
    {
        localStorage.setItem('hashed1pass', onepass_hash); 
        $.mobile.changePage($("#pagefive"), "slide", true, true);
    }
    // User has logged in before, so we need to verify their password
    else {
        if(localStorage.getItem('hashed1pass') != CryptoJS.MD5(onepass))
        {
            navigator.notification.alert("The password you have entered is incorrect."); 
            return; 
        }
        display_list(); 
        $.mobile.changePage($("#pagefour"), "slide", true, true);
    }
}

// Adds a new account and encrypts password
function new_account() {

    // New account details
    var name = document.getElementById("new_name").value;
    var password = document.getElementById("new_password").value;

    // Prompt if user enters blank input
    if(name == "" || password == "")
    {
        navigator.notification.alert("Please enter a site name and password.");
        return;
    }
    if(CryptoJS.MD5(password) == localStorage.getItem('hashed1pass'))
    {
        navigator.notification.alert("Please use a password besides your 1pass.");
        return;
    }

    // Encryption using CryptoJS
    var options = {
        mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    };
    var encrypted_password = CryptoJS.AES.encrypt(password, onepass, options);
    // Add account name and encrypted password to localStorage object
    localStorage.setItem(name, encrypted_password)
    build_list();
    $.mobile.changePage($("#pagefour"), "slide", true, true);
}

// Removes account from localStorage object and rebuilds list
function remove_account(name) {
    localStorage.removeItem(name);
    $.mobile.changePage($("#pagetwo"), "slide", true, true);
    display_list();
}

// Used for bulk password entry by keeping user on page three
function another_new_account() {
    var name = document.getElementById("new_name").value;
    var password = document.getElementById("new_password").value;

    // Prompt if user enters blank input
    if(name == "" || password == "")
    {
        navigator.notification.alert("Please enter a site name and password.");
        return;
    }
    if(CryptoJS.MD5(password) == localStorage.getItem('hashed1pass'))
    {
        navigator.notification.alert("Please use a password besides your 1pass.");
        return;
    }

    // Encryption using CryptoJS
    var options = {
        mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
    };
    var encrypted_password = CryptoJS.AES.encrypt(password, onepass, options);
    // Add account name and encrypted password to localStorage object
    localStorage.setItem(name, encrypted_password)
    build_list();

    // Alert user that password was added successfully
    navigator.notification.alert("Saved successfully!");
}

// Helper function for "Show Password List" button. Build list and navigate to page 4 (account list)
function display_list()
{
    build_list();
    $.mobile.changePage($("#pagefour"), "slide", true, true);
}

// Build account list by iterating through localStorage object
function build_list()
{
    // Create a list object
    var list = "<li data-role='divider' class='ui-li-static ui-body-inherit ui-first-child'>Select account to view password</li>";

    for(var key in localStorage)
    {
        if(key == "hashed1pass" || key == "hint")
        {
            list = list;
        }
        else
        {
            list = list + "<li class='ui-btn'><a href='javascript:decrypt_item(\"" + key + "\")'>" + key + "</a><a href='javascript:remove_account(\"" + key + "\")' data-icon='delete'>Delete</a></li>";
        }
    }
    // Updates the list of accounts with the new list
    document.getElementById("ul_list").innerHTML = list;
}

// Decrypts stored account password from given account key
function decrypt_item(name)
{      
    // Decryption using CryptoJS
    var options = { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
    var decrypted_password = CryptoJS.AES.decrypt(localStorage.getItem(name), onepass, options);

    // Notification displays decrypted password
    console.log(decrypted_password.toString(CryptoJS.enc.Utf8));
    navigator.notification.alert("Password is: " + decrypted_password.toString(CryptoJS.enc.Utf8));
}

// Random Password Generator
function generatePassword() {
    
    // Sets up the character set to be used for random generation
    var length = 8;
        charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        retVal = "";

    // Creates a random string of 8 characters from set above
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    // Delivers random string to user as a notification
    navigator.notification.alert("Your random password is: " + retVal)
}

// Function for changing the hint
function change_hint() {

    localStorage.removeItem('hint');
    var new_hint = document.getElementById("new_hint").value;
    localStorage.setItem('hint', new_hint);
    $.mobile.changePage($("#pagetwo"), "slide", true, true);
}

// Function for retrieving the stored hint from localStorage object
function get_hint() {
    document.write(localStorage.getItem('hint'));
}

// Logout function clears cache and navigates to login page
function logout() {
    location.reload(true);
    $.mobile.changePage($("#pageone"), "slide", true, true);
}

// Refreshes to list of accounts everytime page is visited
$(document).on("pageshow","#pagefour",function()
{
  $("#ul_list").listview("refresh");
});
