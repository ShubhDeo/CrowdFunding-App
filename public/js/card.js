
const stripe = Stripe('pk_test_51HzLIeAaM5EyjrRaRGrHRvMX0XFpyw55OyLQmMaZsKWbgsl06ytCdVi10ouNtOYwM11E1pD79YLLbFL2PA2CWYnE00PagmHNHN'); // Your Publishable Key
const elements = stripe.elements();

let style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
}


// Create our card inputs
const card = elements.create('card', { style, hidePostalCode: true });
card.mount('#card-element');








// ajax call
const paymentForm = document.querySelector('#payment-form');

if (paymentForm) {

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let admin = document.querySelector('#admin').textContent;
        let programId = document.querySelector('#program-id').value;
        let formData = new FormData(paymentForm);
        let formObject = {};
        for (let [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        formObject.ngoadmin = admin;
        formObject.programId = programId;


        //Verify Card
        stripe.createToken(card).then((result) => {
            formObject.stripeToken = result.token.id;


            // paymentForm.submit();
            fetch('/payment/charge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formObject)
            }).then(res => {
                return res.json();
            })
                .then(data => {
                    if (data.message) {
                        swal({
                            title: "Payment Successful!",
                            text: "Thank you for contributing to this noble cause",
                            icon: "success",
                            button: {
                                text: 'Go Home',
                                value: 'catch'
                            },
                            closeOnEsc: false
                        }).then(value => {
                            if (value) {
                                window.location.href = '/';
                            }
                        });

                    }
                    else {
                        if (data.paymentFail === false) {
                            swal({
                                title: "Payment Failed!",
                                text: "Oops, an error occured. You can try again.",
                                icon: "error",
                                button: {
                                    text: 'Try again',
                                    value: 'catch'
                                },
                                closeOnEsc: false
                            }).then(value => {
                                if (value) {
                                    const id = data.id;
                                    window.location.href = `/payment/${id}`;
                                }
                            });
                        } else {
                            const { errors } = data;
                            let error = '';
                            errors.forEach(err => {
                                error += err.msg;
                                error += '<br />'
                            })
                            $('#error-message').html(error.replace('\n', '<br />'));
                            $('.alert').show();
                        }
                    }

                }).catch(err => console.log(err));

        }).catch(err => console.log(err))

    })

}


