Feature: Login

As a user I should be able to login to the application if I provide the correct name and password.
Otherwise I should be shown an error message.

Scenario: As a user I can login
    Given I am on the "login" page
    And I enter "Jay" as my "enter-username"
    And I enter "Password123" as my "enter-password"
    When I click the "login-btn" button
    Then I should be on the "usermenu" page

Scenario: As a user I will see an error message if I fail to login
    Given I am on the "login" page
    And I enter "Fail" as my "enter-username"
    And I enter "Fail" as my "enter-password"
    When I click the "login-btn" button
    Then I should be on the "login" page with an error displayed
