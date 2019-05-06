<template>
    <div>
        <b-container class="center" style="max-width: 25rem;">
            <b-card title="Sign In">
                <b-form-group label="Email or Username">
                    <b-form-input placeholder="Email or Username"></b-form-input>
                </b-form-group>
                <b-form-group label="Password">
                    <b-form-input type="password" placeholder="Password"></b-form-input>
                </b-form-group>
                <b-button>Sign In</b-button>
            </b-card>
        </b-container>
    </div>
</template>

<style>

.center {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>