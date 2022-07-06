const LoginPage = require('../../pages/LoginPage');

test('Login', async () => {
    jest
      .spyOn(window, 'fetch')
      .mockResolvedValue({ json: () => ({ token: '123' }) });
  
    render(<LoginPage />);
  
    const emailField = screen.getByRole('textbox', { name: 'Email' });
    const passwordField = screen.getByLabelText('Password');
    const button = screen.getByRole('button');
  
    // fill out and submit form
    fireEvent.change(emailField, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordField, { target: { value: 'password' } });
    fireEvent.click(button);
  
    // it sets loading state
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
  
    await waitFor(() => {
      // it hides form elements
      expect(button).not.toBeInTheDocument();
      expect(emailField).not.toBeInTheDocument();
      expect(passwordField).not.toBeInTheDocument();
  
      // it displays success text and email address
      const loggedInText = screen.getByText('Logged in as');
      expect(loggedInText).toBeInTheDocument();
      const emailAddressText = screen.getByText('test@email.com');
      expect(emailAddressText).toBeInTheDocument();
    });
  });